import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * OTA Webhook Endpoint
 * Receives booking data from Channel Managers (Agoda, Booking.com, etc.)
 * 
 * POST /api/ota/webhook
 * Body: {
 *   source: "OTA_AGODA" | "OTA_BOOKING",
 *   guestName: string,
 *   guestPhone: string,
 *   guestEmail?: string,
 *   roomType: "1 Bed" | "1 Bed VIP" | "2 Beds" | "2 Beds VIP",
 *   branchCode: string,
 *   checkIn: string (ISO date),
 *   checkOut: string (ISO date),
 *   totalAmount: number,
 *   externalId?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { source, guestName, guestPhone, guestEmail, roomType, branchCode, checkIn, checkOut, totalAmount, externalId } = body;

    // Validate required fields
    if (!source || !guestName || !guestPhone || !roomType || !branchCode || !checkIn || !checkOut || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields", required: ["source", "guestName", "guestPhone", "roomType", "branchCode", "checkIn", "checkOut", "totalAmount"] },
        { status: 400 }
      );
    }

    // Validate source
    const validSources = ["OTA_AGODA", "OTA_BOOKING"];
    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: `Invalid source. Must be one of: ${validSources.join(", ")}` },
        { status: 400 }
      );
    }

    // Find the branch
    const branch = await prisma.branch.findUnique({ where: { code: branchCode } });
    if (!branch) {
      return NextResponse.json({ error: `Branch not found: ${branchCode}` }, { status: 404 });
    }

    // Find an available room of the requested type in the branch
    const availableRoom = await prisma.room.findFirst({
      where: {
        roomType: { name: roomType },
        branchId: branch.id,
        status: "AVAILABLE",
      },
    });

    if (!availableRoom) {
      return NextResponse.json(
        { error: `No available ${roomType} rooms at branch ${branchCode}` },
        { status: 409 }
      );
    }

    // Create or find guest
    let guest = await prisma.guest.findFirst({ where: { phone: guestPhone } });
    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          name: guestName,
          phone: guestPhone,
          email: guestEmail || null,
        },
      });
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        guestId: guest.id,
        roomId: availableRoom.id,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalAmount,
        deposit: 0,
        source,
        status: "CONFIRMED",
      },
    });

    // Mark room as occupied
    await prisma.room.update({
      where: { id: availableRoom.id },
      data: { status: "OCCUPIED" },
    });

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      roomNumber: availableRoom.number,
      branch: branch.name,
      message: `Booking confirmed for ${guestName} in Room #${availableRoom.number}`,
    }, { status: 201 });

  } catch (error: any) {
    console.error("OTA Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/ota/webhook",
    methods: ["POST"],
    description: "OTA Channel Manager Webhook for receiving bookings from Agoda, Booking.com, etc.",
    requiredFields: {
      source: "OTA_AGODA | OTA_BOOKING",
      guestName: "string",
      guestPhone: "string",
      guestEmail: "string (optional)",
      roomType: "1 Bed | 1 Bed VIP | 2 Beds | 2 Beds VIP",
      branchCode: "string (e.g. BKK_001)",
      checkIn: "ISO date string",
      checkOut: "ISO date string",
      totalAmount: "number",
    },
  });
}
