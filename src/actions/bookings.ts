"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBooking(formData: FormData) {
  try {
    const guestName = formData.get("guestName") as string;
    const guestPhone = formData.get("phone") as string;
    const guestEmail = formData.get("email") as string | undefined;
    const roomIdsStr = formData.get("roomIds") as string;
    const checkInStr = formData.get("checkIn") as string;
    const checkOutStr = formData.get("checkOut") as string;
    const totalAmount = parseFloat((formData.get("totalAmount") as string) || "0");
    const deposit = parseFloat((formData.get("deposit") as string) || "0");
    const source = formData.get("source") as any || "WALK_IN";
    const paymentMethod = (formData.get("paymentMethod") as string) || "CASH";

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
      // 1. Create or Find Guest
      let guest = await tx.guest.findFirst({
        where: { phone: guestPhone },
      });

      if (!guest) {
        guest = await tx.guest.create({
          data: {
            name: guestName,
            phone: guestPhone,
            email: guestEmail,
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
              status: "CONFIRMED",
            },
          })
        )
      );

      // 4. Create payment for deposit on first reservation (if any)
      if (deposit > 0 && reservations.length > 0) {
        await tx.payment.create({
          data: {
            reservationId: reservations[0].id,
            amount: deposit,
            method: paymentMethod as any,
            status: "COMPLETED",
          },
        });
      }

      // 5. Update all room statuses to OCCUPIED
      await Promise.all(
        roomIds.map((roomId) =>
          tx.room.update({
            where: { id: roomId },
            data: { status: "OCCUPIED" },
          })
        )
      );
    });

    revalidatePath("/rooms");
    revalidatePath("/bookings");
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  // Redirect outside of try/catch to avoid Next.js redirect error being caught
  redirect("/rooms");
}
