import { PrismaClient } from '@prisma/client';

// Check if DATABASE_URL is configured
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not configured!');
  throw new Error('DATABASE_URL environment variable is required');
}

// Add connection pooling to DATABASE_URL with very strict limits
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL!;
  
  // Add aggressive connection pooling parameters
  if (!url.includes('connection_limit')) {
    const separator = url.includes('?') ? '&' : '?';
    // Use only 1 connection to avoid exhausting the pool
    return `${url}${separator}connection_limit=1&pool_timeout=0`;
  }
  return url;
};

// Create a single Prisma instance with minimal connections
const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
});

// Don't connect at startup - connect on demand
let isConnected = false;

// Helper to ensure connection
export const ensureConnected = async () => {
  if (!isConnected) {
    await prisma.$connect();
    isConnected = true;
    console.log('✅ Database connected');
  }
};

// Disconnect and reconnect to clear any stuck connections
export const reconnect = async () => {
  try {
    await prisma.$disconnect();
    isConnected = false;
    await ensureConnected();
  } catch (e) {
    console.error('Reconnect failed:', e);
  }
};

// Disconnect on shutdown
const shutdown = async () => {
  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error('Shutdown error:', e);
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('beforeExit', shutdown);

export default prisma;
