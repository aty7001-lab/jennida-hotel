"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBooking(bookingType: "immediate" | "advance", formData: FormData) {
  const isImmediate = bookingType === "immediate";
  try {
    const guestName = formData.get("guestName") as string;
    const guestPhone = formData.get("phone") as string;
    const guestEmail = formData.get("email") as string | undefined;
    const roomIdsStr = formData.get("roomIds") as string;
    const checkInStr = formData.get("checkIn") as string;
    const checkOutStr = formData.get("checkOut") as string;
    const totalAmount = parseFloat((formData.get("totalAmount") as string) || "0");
    const depositTransfer = parseFloat((formData.get("depositTransfer") as string) || "0");
    const depositCash = parseFloat((formData.get("depositCash") as string) || "0");
    const source = formData.get("source") as any || "WALK_IN";

    if (!guestName || !guestPhone || !roomIdsStr || !checkInStr || !checkOutStr) {
      throw new Error("Missing required fields");
    }

    const roomIds: string[] = JSON.parse(roomIdsStr);
    if (roomIds.length === 0) {
      throw new Error("No rooms selected");
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    // Use transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Create or Find Guest — always update name/email with latest entry
      const existingGuest = await tx.guest.findFirst({
        where: { phone: guestPhone },
      });

      let guest;
      if (!existingGuest) {
        guest = await tx.guest.create({
          data: {
            name: guestName,
            phone: guestPhone,
            email: guestEmail,
          },
        });
      } else {
        guest = await tx.guest.update({
          where: { id: existingGuest.id },
          data: {
            name: guestName,
            ...(guestEmail ? { email: guestEmail } : {}),
          },
        });
      }

      // 2. Fetch all selected rooms to calculate per-room amounts
      const selectedRooms = await tx.room.findMany({
        where: { id: { in: roomIds } },
      });

      if (selectedRooms.length !== roomIds.length) {
        throw new Error("One or more selected rooms not found");
      }

      const nights = Math.round(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (nights <= 0) {
        throw new Error("Invalid check-in/check-out dates");
      }

      // 3. Create one Reservation per room (with per-room amount)
      const reservations = await Promise.all(
        selectedRooms.map((room) =>
          tx.reservation.create({
            data: {
              guestId: guest.id,
              roomId: room.id,
              checkIn: checkIn,
              checkOut: checkOut,
              totalAmount: room.price * nights,
              deposit: 0,
              source: source,
              status: isImmediate ? "CHECKED_IN" : "CONFIRMED",
            },
          })
        )
      );

      // 4. Create payment records — distribute deposit proportionally across rooms
      if (reservations.length > 0 && (depositTransfer > 0 || depositCash > 0)) {
        const totalValue = selectedRooms.reduce((s, r) => s + r.price * nights, 0) || 1;
        for (let i = 0; i < reservations.length; i++) {
          const share = (selectedRooms[i].price * nights) / totalValue;
          const tAmt = Math.round(depositTransfer * share);
          const cAmt = Math.round(depositCash * share);
          if (tAmt > 0) {
            await tx.payment.create({
              data: { reservationId: reservations[i].id, amount: tAmt, method: "TRANSFER", status: "COMPLETED" },
            });
          }
          if (cAmt > 0) {
            await tx.payment.create({
              data: { reservationId: reservations[i].id, amount: cAmt, method: "CASH", status: "COMPLETED" },
            });
          }
        }
      }

      // 5. Update room statuses — only for immediate check-in
      if (isImmediate) {
        await Promise.all(
          roomIds.map((roomId) =>
            tx.room.update({
              where: { id: roomId },
              data: { status: "OCCUPIED" },
            })
          )
        );
      }
    });

    revalidatePath("/rooms");
    revalidatePath("/bookings");
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  // Redirect outside of try/catch to avoid Next.js redirect error being caught
  redirect("/bookings");
}
