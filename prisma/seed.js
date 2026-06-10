const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // 1. Branches
  const bkkBranch = await prisma.branch.upsert({
    where: { code: 'BKK_001' },
    update: {},
    create: { name: 'Bangkok Riverside', code: 'BKK_001', address: '123 Riverside Rd, Bangkok' },
  });

  const cnxBranch = await prisma.branch.upsert({
    where: { code: 'CNX_001' },
    update: {},
    create: { name: 'Chiang Mai Retreat', code: 'CNX_001', address: '456 Mountain View, Chiang Mai' },
  });
  console.log('✅ Branches seeded');

  // 2. Users
  const adminPass = await bcrypt.hash('admin123', 10);
  const staffPass = await bcrypt.hash('staff123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@hotel.com' },
    update: {},
    create: { email: 'admin@hotel.com', name: 'Admin Hotel', password: adminPass, role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'staff.bkk@hotel.com' },
    update: {},
    create: { email: 'staff.bkk@hotel.com', name: 'Staff BKK', password: staffPass, role: 'STAFF', branchId: bkkBranch.id },
  });
  console.log('✅ Users seeded (admin@hotel.com / admin123)');

  // 3. Rooms — only if empty
  const count = await prisma.room.count();
  if (count === 0) {
    const rooms = [];

    // Bangkok Riverside (Hotel 2) — Standard rooms
    for (let i = 1; i <= 10; i++) rooms.push({ number: `1${String(i).padStart(2,'0')}`, type: 'Standard', price: 200000, branchId: bkkBranch.id });
    for (let i = 1; i <= 5;  i++) rooms.push({ number: `2${String(i).padStart(2,'0')}`, type: 'Deluxe',   price: 250000, branchId: bkkBranch.id });
    for (let i = 1; i <= 5;  i++) rooms.push({ number: `3${String(i).padStart(2,'0')}`, type: 'Suite',    price: 300000, branchId: bkkBranch.id });

    // Chiang Mai Retreat (Hotel 1) — 20 ຫ້ອງຈິງ
    const cnxRooms = [
      // VIP 250,000₭
      { number: '101', type: 'VIP', price: 250000 },
      { number: '102', type: 'VIP', price: 250000 },
      { number: '103', type: 'VIP', price: 250000 },
      { number: '201', type: 'VIP', price: 250000 },
      { number: '202', type: 'VIP', price: 250000 },
      { number: '205', type: 'VIP', price: 250000 },
      // Standard 200,000₭
      { number: '104', type: 'Standard', price: 200000 },
      { number: '105', type: 'Standard', price: 200000 },
      { number: '106', type: 'Standard', price: 200000 },
      { number: '203', type: 'Standard', price: 200000 },
      { number: '204', type: 'Standard', price: 200000 },
      { number: '206', type: 'Standard', price: 200000 },
      { number: '207', type: 'Standard', price: 200000 },
      { number: '301', type: 'Standard', price: 200000 },
      { number: '302', type: 'Standard', price: 200000 },
      { number: '303', type: 'Standard', price: 200000 },
      { number: '304', type: 'Standard', price: 200000 },
      { number: '305', type: 'Standard', price: 200000 },
      { number: '306', type: 'Standard', price: 200000 },
      { number: '307', type: 'Standard', price: 200000 },
    ];
    for (const r of cnxRooms) rooms.push({ ...r, branchId: cnxBranch.id });

    for (const r of rooms) await prisma.room.create({ data: r });
    console.log(`✅ ${rooms.length} rooms seeded (${cnxRooms.length} for Hotel 1, ${rooms.length - cnxRooms.length} for Hotel 2)`);
  } else {
    console.log('⏭️  Rooms already exist, skipping.');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
