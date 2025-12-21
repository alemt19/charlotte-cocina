import { prisma } from '../../db/client.js';

export const findItems = async ({ type, stock_status: stockStatus }) => {
  if (stockStatus === 'LOW') {
    if (type) {
      return await prisma.$queryRaw`SELECT * FROM "InventoryItem" WHERE "type" = ${type} AND "currentStock" < "minStockAlert"`;
    }
    return await prisma.$queryRaw`SELECT * FROM "InventoryItem" WHERE "currentStock" < "minStockAlert"`;
  }

  const where = {};
  if (type) where.type = type;

  return await prisma.inventoryItem.findMany({ where });
};

export const createItem = async ({ name, type, unit, minStockAlert }) => {
  // Verificar unicidad por nombre
  const existing = await prisma.inventoryItem.findFirst({ where: { name } });
  if (existing) {
    const err = new Error('Duplicate name');
    err.code = 'P2025_DUPLICATE';
    throw err;
  }

  const data = {
    name,
    type,
    unit,
    currentStock: 0,
    minStockAlert: Math.round(minStockAlert || 0)
  };

  return await prisma.inventoryItem.create({ data });
};
