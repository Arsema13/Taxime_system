import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: process.env.DATABASE_URL ? {
    db: { url: process.env.DATABASE_URL },
  } : undefined,
});

export default prisma;
