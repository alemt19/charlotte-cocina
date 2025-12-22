import { prisma } from '../db/client.js';

(async () => {
  try {
    console.log('Ensuring column cost_at_time exists on inventory_logs...');
    await prisma.$executeRawUnsafe(`ALTER TABLE IF EXISTS inventory_logs ADD COLUMN IF NOT EXISTS cost_at_time numeric(10,2)`);
    console.log('Done.');
  } catch (err) {
    console.error('Error ensuring column:', err);
  } finally {
    await prisma.$disconnect();
  }
})();