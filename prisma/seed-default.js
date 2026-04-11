const bcrypt = require('bcryptjs');

// Import prisma dari lib yang sudah dikonfigurasi
const { prisma } = require('../lib/prisma.js');

async function main() {
  console.log('Start seeding default data...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('Passw0rdAdmin', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@leher.local',
      name: 'Administrator',
      password: adminPassword,
      role: 'ADMIN',
      isTeam: false,
    },
  });
  console.log('Created admin:', admin.username);
  
  // Create default member
  const memberPassword = await bcrypt.hash('Passw0rdMember', 10);
  const member = await prisma.user.upsert({
    where: { username: 'dedirosandi' },
    update: {},
    create: {
      username: 'dedirosandi',
      email: 'dedirosandi@leher.local',
      name: 'Dedi Rosandi',
      password: memberPassword,
      role: 'MEMBER',
      isTeam: true,
      ig: 'dedirosandi',
    },
  });
  console.log('Created member:', member.username);
  
  // Create default about
  const about = await prisma.about.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      content: 'Leher Adventure adalah komunitas petualangan yang didedikasikan untuk menjelajahi keindahan alam Indonesia. Kami percaya bahwa setiap perjalanan adalah kesempatan untuk belajar, bertumbuh, dan menciptakan kenangan tak terlupakan.',
    },
  });
  console.log('Created about');
  
  // Create default hero text
  const heroText = await prisma.heroText.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      titleLine1: 'Selamat Datang di',
      titleLine2: 'Leher Adventure',
      description: 'Jelajahi keindahan alam Indonesia bersama kami. Setiap perjalanan adalah cerita yang tak terlupakan.',
    },
  });
  console.log('Created hero text');
  
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
