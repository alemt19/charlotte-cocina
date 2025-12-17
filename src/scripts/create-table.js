import { prisma } from '../db/client.js';

(async () => {
  try {
    console.log('Creando tabla InventoryItem si no existe...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "InventoryItem" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "type" TEXT NOT NULL,
        "currentStock" INTEGER NOT NULL DEFAULT 0,
        "minStockAlert" INTEGER NOT NULL DEFAULT 0,
        "unit" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    console.log('Tabla creada (o ya existente).');
  } catch (err) {
    console.error('Error creando tabla:', err);
  } finally {
    await prisma.$disconnect();
  }
})();
