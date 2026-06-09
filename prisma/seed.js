const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
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
  console.log('✅ Admin user created (admin@hotel.com / admin123)');

  const staffPassword = await bcrypt.hash('staff123', 10);
  await prisma.user.upsert({
    where: { email: 'staff@hotel.com' },
    update: {},
    create: {
      email: 'staff@hotel.com',
      name: 'Front Desk',
      password: staffPassword,
      role: 'STAFF',
    },
  });
  console.log('✅ Staff user created (staff@hotel.com / staff123)');

  const count = await prisma.room.count();
  if (count === 0) {
    const rooms = [];
    for (let i = 1; i <= 10; i++) {
      rooms.push({ number: `1${i.toString().padStart(2, '0')}`, type: 'Standard', price: 1000 });
    }
    for (let i = 1; i <= 5; i++) {
      rooms.push({ number: `2${i.toString().padStart(2, '0')}`, type: 'Deluxe', price: 2000 });
    }
    for (let i = 1; i <= 5; i++) {
      rooms.push({ number: `3${i.toString().padStart(2, '0')}`, type: 'Suite', price: 3000 });
    }
    for (const r of rooms) {
      await prisma.room.create({ data: r });
    }
    console.log('✅ 20 Rooms seeded (10 Standard, 5 Deluxe, 5 Suite)');
  } else {
    console.log('⏭️  Rooms already exist, skipping.');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
