import { prisma } from '../../db/client.js';

export const findItems = async ({ type, stockStatus }) => {
  if (stockStatus === 'LOW') {
    if (type) {
      return await prisma.$queryRaw`SELECT * FROM "inventory_items" WHERE "type" = ${type} AND "current_stock" < "min_stock_alert"`;
    }
    return await prisma.$queryRaw`SELECT * FROM "inventory_items" WHERE "current_stock" < "min_stock_alert"`;
  }

  const where = {};
  if (type) where.type = type;

  return await prisma.inventoryItem.findMany({ where });
};

export const createItem = async ({ name, type, unitMeasure, minStockAlert }) => {
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
    unitMeasure,
    currentStock: 0,
    minStockAlert: Math.round(minStockAlert || 0)
  };

  return await prisma.inventoryItem.create({ data });
};

export const getItemById = async (id) => {
  return await prisma.inventoryItem.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      type: true,
      currentStock: true,
      unitMeasure: true,
      averageCost: true,
      minStockAlert: true,
      lastUpdated: true
    }
  });
};

export const updateItem = async (id, updates) => {
  // Disallow updating currentStock or averageCost here
  const { name, minStockAlert, unitMeasure } = updates;

  const data = {};
  if (name !== undefined) data.name = name;
  if (minStockAlert !== undefined) data.minStockAlert = minStockAlert;
  if (unitMeasure !== undefined) data.unitMeasure = unitMeasure;

  return await prisma.inventoryItem.update({ where: { id }, data });
};
