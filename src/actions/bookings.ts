"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBooking(formData: FormData) {
  try {
    const guestName = formData.get("guestName") as string;
    const guestPhone = formData.get("phone") as string;
    const guestEmail = formData.get("email") as string | undefined;
    const roomId = formData.get("roomId") as string;
    const checkInStr = formData.get("checkIn") as string;
    const checkOutStr = formData.get("checkOut") as string;
    const totalAmount = parseFloat((formData.get("totalAmount") as string) || "0");
    const deposit = parseFloat((formData.get("deposit") as string) || "0");
    const source = formData.get("source") as any || "WALK_IN";
    const paymentMethod = (formData.get("paymentMethod") as string) || "CASH";

    if (!guestName || !guestPhone || !roomId || !checkInStr || !checkOutStr) {
      throw new Error("Missing required fields");
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    // 1. Create or Find Guest
    let guest = await prisma.guest.findFirst({
      where: { phone: guestPhone },
    });

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: guestName,
          phone: guestPhone,
          email: guestEmail,
        },
      });
    }

    // 2. Create Reservation
    const reservation = await prisma.reservation.create({
      data: {
        guestId: guest.id,
        roomId: roomId,
        checkIn: checkIn,
        checkOut: checkOut,
        totalAmount: totalAmount,
        deposit: deposit,
        source: source,
        status: "CONFIRMED",
      },
    });

    // 3. Record deposit payment if any
    if (deposit > 0) {
      await prisma.payment.create({
        data: {
          reservationId: reservation.id,
          amount: deposit,
          method: paymentMethod as any,
          status: "COMPLETED",
        },
      });
    }

    // 4. Update Room Status
    await prisma.room.update({
      where: { id: roomId },
      data: { status: "OCCUPIED" },
    });
    
    revalidatePath("/rooms");
    revalidatePath("/bookings");
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating booking:", error);
    // In a real app we would use useFormState, but for MVP we will just let it fail silently or throw
    throw new Error("Failed to create booking");
  }

  // Redirect outside of try/catch to avoid Next.js redirect error being caught
  redirect("/rooms");
}
