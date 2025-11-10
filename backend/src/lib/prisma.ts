import { PrismaClient } from '@prisma/client';

// Check if DATABASE_URL is configured
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not configured!');
  throw new Error('DATABASE_URL environment variable is required');
}

// Add connection pooling to DATABASE_URL
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL!;
  
  // Add connection pooling parameters
  if (!url.includes('connection_limit')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}connection_limit=3&pool_timeout=20&connect_timeout=10`;
  }
  return url;
};

// Create a single Prisma instance
const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
});

// Connect once at startup
prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch((e) => console.error('❌ Database connection failed:', e.message));

// Disconnect on shutdown
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default prisma;
