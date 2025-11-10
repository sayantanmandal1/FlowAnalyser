import { PrismaClient } from '@prisma/client';

// Check if DATABASE_URL is configured
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not configured!');
  console.error('Please set DATABASE_URL environment variable in Render dashboard');
}

// Declare global type for Prisma singleton
declare global {
  var __prisma: PrismaClient | undefined;
}

// Add connection pooling to DATABASE_URL if not present
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  
  // Add connection pooling parameters if not present
  if (!url.includes('connection_limit')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}connection_limit=5&pool_timeout=10`;
  }
  return url;
};

// Singleton Prisma Client to prevent too many connections
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: getDatabaseUrl()
      }
    }
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
      datasources: {
        db: {
          url: getDatabaseUrl()
        }
      }
    });
  }
  prisma = global.__prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
