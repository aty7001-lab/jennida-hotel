import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || "postgresql://hotel_admin:hotel_password@localhost:5432/hotel_db?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Deleting old data...");
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.room.deleteMany();

  const branch = await prisma.branch.findFirst({ where: { code: 'BKK_001' } });
  if (!branch) {
    throw new Error("Branch BKK_001 not found. Please ensure seed was run initially.");
  }

  // Upsert room types for this branch
  const upsertType = (name: string) =>
    prisma.roomType.upsert({
      where: { name_branchId: { name, branchId: branch.id } },
      update: {},
      create: { name, branchId: branch.id },
    });

  const type1Bed     = await upsertType('1 Bed');
  const type1BedVip  = await upsertType('1 Bed VIP');
  const type2Beds    = await upsertType('2 Beds');
  const type2BedsVip = await upsertType('2 Beds VIP');

  const bed1    = ['101', '102', '105', '107', '109', '110', '201', '202', '205', '207', '208', '219', '301', '302', '306', '307', '308', '311', '314'];
  const bed1Vip = ['214', '216', '218', '315', '316'];
  const bed2    = ['103', '104', '106', '108', '203', '204', '206', '209', '210', '211', '212', '303', '304', '305', '309', '310', '320'];
  const bed2Vip = ['215', '217', '312', '317', '318', '319'];

  const roomsData = [
    ...bed1.map(n    => ({ number: n, roomTypeId: type1Bed.id,     price: 200000, branchId: branch.id })),
    ...bed1Vip.map(n => ({ number: n, roomTypeId: type1BedVip.id,  price: 250000, branchId: branch.id })),
    ...bed2.map(n    => ({ number: n, roomTypeId: type2Beds.id,    price: 200000, branchId: branch.id })),
    ...bed2Vip.map(n => ({ number: n, roomTypeId: type2BedsVip.id, price: 250000, branchId: branch.id })),
  ];

  let count = 0;
  for (const r of roomsData) {
    await prisma.room.create({ data: r });
    count++;
  }

  console.log(`Successfully seeded ${count} real rooms!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
