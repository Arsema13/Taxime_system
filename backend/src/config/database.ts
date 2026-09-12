import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: process.env.DATABASE_URL ? {
    db: { url: process.env.DATABASE_URL },
  } : undefined,
});

// Handle Neon/serverless connection drops by reconnecting on error
prisma.$connect().catch((e) => {
  console.error('[DB] Initial connection failed:', e.message);
});

export default prisma;
