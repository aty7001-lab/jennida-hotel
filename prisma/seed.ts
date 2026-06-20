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

  // 3. Upsert RoomTypes per branch
  const upsertType = (name: string, branchId: string) =>
    prisma.roomType.upsert({
      where: { name_branchId: { name, branchId } },
      update: {},
      create: { name, branchId },
    });

  // BKK room types
  const bkkStandard = await upsertType('Standard', bkkBranch.id);
  const bkkDeluxe   = await upsertType('Deluxe',   bkkBranch.id);
  const bkkSuite    = await upsertType('Suite',     bkkBranch.id);

  // CNX room types
  const cnxVip      = await upsertType('VIP',      cnxBranch.id);
  const cnxStandard = await upsertType('Standard', cnxBranch.id);

  console.log('RoomTypes seeded!');

  // 4. Seed Rooms
  const count = await prisma.room.count();
  if (count === 0) {
    // BKK Rooms
    for (let i = 1; i <= 10; i++) {
      await prisma.room.create({ data: { number: `1${i.toString().padStart(2, '0')}`, roomTypeId: bkkStandard.id, price: 1000, branchId: bkkBranch.id } });
    }
    for (let i = 1; i <= 5; i++) {
      await prisma.room.create({ data: { number: `2${i.toString().padStart(2, '0')}`, roomTypeId: bkkDeluxe.id, price: 2000, branchId: bkkBranch.id } });
    }
    for (let i = 1; i <= 5; i++) {
      await prisma.room.create({ data: { number: `3${i.toString().padStart(2, '0')}`, roomTypeId: bkkSuite.id, price: 3000, branchId: bkkBranch.id } });
    }

    // CNX Rooms — Jennida Hotel 1 (20 ຫ້ອງ)
    const cnxRooms: { number: string; roomTypeId: string; price: number }[] = [
      // VIP 250,000₭
      { number: '101', roomTypeId: cnxVip.id, price: 250000 },
      { number: '102', roomTypeId: cnxVip.id, price: 250000 },
      { number: '103', roomTypeId: cnxVip.id, price: 250000 },
      { number: '201', roomTypeId: cnxVip.id, price: 250000 },
      { number: '202', roomTypeId: cnxVip.id, price: 250000 },
      { number: '205', roomTypeId: cnxVip.id, price: 250000 },
      // Standard 200,000₭
      { number: '104', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '105', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '106', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '203', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '204', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '206', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '207', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '301', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '302', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '303', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '304', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '305', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '306', roomTypeId: cnxStandard.id, price: 200000 },
      { number: '307', roomTypeId: cnxStandard.id, price: 200000 },
    ];
    for (const r of cnxRooms) {
      await prisma.room.create({ data: { ...r, branchId: cnxBranch.id } });
    }
    console.log('Rooms seeded successfully!');
  } else {
    console.log('Rooms already exist, skipping seed.');
  }

  // 5. Seed Guests, Reservations, and Payments
  const guestCount = await prisma.guest.count();
  if (guestCount === 0) {
    const allRooms = await prisma.room.findMany();
    if (allRooms.length > 0) {
      const guestsData = [
        { name: "Sompong Jaidee", phone: "0812345678", email: "sompong@example.com" },
        { name: "Mana Rakthai", phone: "0898765432", email: "mana@example.com" },
        { name: "John Doe", phone: "+1234567890", email: "john.doe@example.com" },
      ];

      const guests = [];
      for (const g of guestsData) {
        guests.push(await prisma.guest.create({ data: g }));
      }

      const res1 = await prisma.reservation.create({
        data: {
          guestId: guests[0].id,
          roomId: allRooms[0].id,
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 86400000 * 2),
          status: "CONFIRMED",
          source: "WALK_IN",
          totalAmount: 2000,
          deposit: 1000,
        }
      });
      await prisma.payment.create({
        data: { reservationId: res1.id, amount: 1000, method: "CASH", status: "COMPLETED" }
      });
      await prisma.room.update({ where: { id: allRooms[0].id }, data: { status: "OCCUPIED" } });

      const res2 = await prisma.reservation.create({
        data: {
          guestId: guests[1].id,
          roomId: allRooms[1].id,
          checkIn: new Date(Date.now() - 86400000 * 3),
          checkOut: new Date(Date.now() - 86400000),
          status: "CHECKED_OUT",
          source: "OTA_AGODA",
          totalAmount: 2000,
          deposit: 2000,
        }
      });
      await prisma.payment.create({
        data: { reservationId: res2.id, amount: 2000, method: "CREDIT_CARD", status: "COMPLETED" }
      });
      await prisma.room.update({ where: { id: allRooms[1].id }, data: { status: "CLEANING" } });

      const res3 = await prisma.reservation.create({
        data: {
          guestId: guests[2].id,
          roomId: allRooms[2].id,
          checkIn: new Date(Date.now() + 86400000 * 5),
          checkOut: new Date(Date.now() + 86400000 * 7),
          status: "PENDING",
          source: "OTA_BOOKING",
          totalAmount: 4000,
          deposit: 0,
        }
      });
      await prisma.payment.create({
        data: { reservationId: res3.id, amount: 4000, method: "TRANSFER", status: "PENDING" }
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
