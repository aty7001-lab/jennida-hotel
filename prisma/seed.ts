import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || "postgresql://hotel_admin:hotel_password@localhost:5432/hotel_db?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create Branches
  const bkkBranch = await prisma.branch.upsert({
    where: { code: 'BKK_001' },
    update: {},
    create: {
      name: 'Bangkok Riverside',
      code: 'BKK_001',
      address: '123 Riverside Rd, Bangkok',
    },
  });

  const cnxBranch = await prisma.branch.upsert({
    where: { code: 'CNX_001' },
    update: {},
    create: {
      name: 'Chiang Mai Retreat',
      code: 'CNX_001',
      address: '456 Mountain View, Chiang Mai',
    },
  });
  console.log('Branches seeded!');

  // 2. Create Admin & Staff
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@hotel.com' },
    update: {},
    create: {
      email: 'admin@hotel.com',
      name: 'Admin Hotel',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff.bkk@hotel.com' },
    update: {},
    create: {
      email: 'staff.bkk@hotel.com',
      name: 'Staff BKK',
      password: hashedPassword,
      role: 'STAFF',
      branchId: bkkBranch.id,
    },
  });
  console.log('Users seeded!');

  // 3. Seed Rooms for BKK Branch
  const count = await prisma.room.count();
  if (count === 0) {
    const rooms = [];
    
    // BKK Rooms
    for (let i = 1; i <= 10; i++) {
      rooms.push({ number: `1${i.toString().padStart(2, '0')}`, type: 'Standard', price: 1000, branchId: bkkBranch.id });
    }
    for (let i = 1; i <= 5; i++) {
      rooms.push({ number: `2${i.toString().padStart(2, '0')}`, type: 'Deluxe', price: 2000, branchId: bkkBranch.id });
    }
    for (let i = 1; i <= 5; i++) {
      rooms.push({ number: `3${i.toString().padStart(2, '0')}`, type: 'Suite', price: 3000, branchId: bkkBranch.id });
    }

    // CNX Rooms (different pricing)
    for (let i = 1; i <= 10; i++) {
      rooms.push({ number: `1${i.toString().padStart(2, '0')}`, type: 'Standard', price: 800, branchId: cnxBranch.id });
    }

    for (const r of rooms) {
      await prisma.room.create({ data: r });
    }
    console.log('Rooms seeded successfully!');
  } else {
    console.log('Rooms already exist, skipping seed.');
  }

  // 4. Seed Guests, Reservations, and Payments
  const guestCount = await prisma.guest.count();
  if (guestCount === 0) {
    const allRooms = await prisma.room.findMany();
    if (allRooms.length > 0) {
      // Create some mock guests
      const guestsData = [
        { name: "Sompong Jaidee", phone: "0812345678", email: "sompong@example.com" },
        { name: "Mana Rakthai", phone: "0898765432", email: "mana@example.com" },
        { name: "John Doe", phone: "+1234567890", email: "john.doe@example.com" },
      ];

      const guests = [];
      for (const g of guestsData) {
        guests.push(await prisma.guest.create({ data: g }));
      }

      // Create some reservations
      // Guest 1: confirmed, paid via cash
      const res1 = await prisma.reservation.create({
        data: {
          guestId: guests[0].id,
          roomId: allRooms[0].id, // bkk standard
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 86400000 * 2), // +2 days
          status: "CONFIRMED",
          source: "WALK_IN",
          totalAmount: 2000,
          deposit: 1000,
        }
      });
      await prisma.payment.create({
        data: {
          reservationId: res1.id,
          amount: 1000,
          method: "CASH",
          status: "COMPLETED",
        }
      });
      await prisma.room.update({
        where: { id: allRooms[0].id },
        data: { status: "OCCUPIED" }
      });

      // Guest 2: checked out
      const res2 = await prisma.reservation.create({
        data: {
          guestId: guests[1].id,
          roomId: allRooms[1].id,
          checkIn: new Date(Date.now() - 86400000 * 3), // -3 days
          checkOut: new Date(Date.now() - 86400000), // -1 day
          status: "CHECKED_OUT",
          source: "OTA_AGODA",
          totalAmount: 2000,
          deposit: 2000,
        }
      });
      await prisma.payment.create({
        data: {
          reservationId: res2.id,
          amount: 2000,
          method: "CREDIT_CARD",
          status: "COMPLETED",
        }
      });
      await prisma.room.update({
        where: { id: allRooms[1].id },
        data: { status: "CLEANING" }
      });

      // Guest 3: pending payment
      const res3 = await prisma.reservation.create({
        data: {
          guestId: guests[2].id,
          roomId: allRooms[2].id,
          checkIn: new Date(Date.now() + 86400000 * 5), // +5 days
          checkOut: new Date(Date.now() + 86400000 * 7), // +7 days
          status: "PENDING",
          source: "OTA_BOOKING",
          totalAmount: 4000,
          deposit: 0,
        }
      });
      await prisma.payment.create({
        data: {
          reservationId: res3.id,
          amount: 4000,
          method: "TRANSFER",
          status: "PENDING",
        }
      });

      console.log('Guests, Reservations, and Payments seeded successfully!');
    }
  } else {
    console.log('Guests already exist, skipping seed.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
