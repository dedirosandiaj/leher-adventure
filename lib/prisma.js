import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Prisma Client singleton with PostgreSQL adapter
const globalForPrisma = globalThis;

const prismaClientSingleton = () => {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma;

// Helper untuk backward compatibility dengan kode lama
// Model mapping dari nama lama ke nama baru
export const db = {
  // User (gabungan Admin, Member, TeamMember)
  user: prisma.user,
  
  // Media (gabungan Gallery, HeroSlide)
  media: prisma.media,
  
  // Content
  about: prisma.about,
  heroText: prisma.heroText,
  
  // Journey
  mountain: prisma.mountain,
  journey: prisma.journey,
  
  // Equipment
  equipmentCategory: prisma.equipmentCategory,
  equipmentItem: prisma.equipmentItem,
  userEquipment: prisma.userEquipment,
  
  // Journey Registration
  journeyRegistration: prisma.journeyRegistration,
  
  // Expense
  expense: prisma.expense,
  
  // Backward compatibility aliases
  get admin() { return prisma.user; },
  get member() { return prisma.user; },
  get teamMember() { return prisma.user; },
  get gallery() { return prisma.media; },
  get heroSlide() { return prisma.media; },
  get equipmentitem() { return prisma.equipmentItem; },
  get memberequipment() { return prisma.userEquipment; },
};

export default prisma;
