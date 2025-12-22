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

export const registerInbound = async ({ itemId, quantityChange, costAtTime, movementType, reason }) => {
  // Ensure item exists
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) {
    const err = new Error('Item not found');
    err.code = 'P2025_NOT_FOUND';
    throw err;
  }

  // Convert to numbers for calculation
  const currentStock = Number(item.currentStock ?? 0);
  const averageCost = Number(item.averageCost ?? 0);

  const newStockTotal = currentStock + Number(quantityChange);
  const costTotalCurrent = currentStock * averageCost;
  const costTotalNew = costTotalCurrent + Number(quantityChange) * Number(costAtTime);
  const newAverageCost = newStockTotal > 0 ? costTotalNew / newStockTotal : 0;

  const result = await prisma.$transaction(async (tx) => {
    const log = await tx.inventoryLog.create({
      data: {
        itemId,
        movementType,
        quantityChange: Number(quantityChange),
        costAtTime: Number(costAtTime),
        reason
      }
    });

    const updated = await tx.inventoryItem.update({
      where: { id: itemId },
      data: {
        currentStock: newStockTotal,
        averageCost: newAverageCost
      }
    });

    return { log, updated };
  });

  return { message: 'Inbound registered', averageCost: result.updated.averageCost, currentStock: result.updated.currentStock };
};

export const registerOutbound = async ({ itemId, quantityChange, movementType, reason }) => {
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) {
    const err = new Error('Item not found');
    err.code = 'P2025_NOT_FOUND';
    throw err;
  }

  const currentStock = Number(item.currentStock ?? 0);
  const averageCost = Number(item.averageCost ?? 0);

  if (currentStock < Number(quantityChange)) {
    const err = new Error('Insufficient stock');
    err.code = 'INSUFFICIENT_STOCK';
    throw err;
  }

  const result = await prisma.$transaction(async (tx) => {
    const log = await tx.inventoryLog.create({
      data: {
        itemId,
        movementType,
        quantityChange: Number(quantityChange),
        costAtTime: averageCost,
        reason
      }
    });

    const updated = await tx.inventoryItem.update({
      where: { id: itemId },
      data: {
        currentStock: currentStock - Number(quantityChange)
      }
    });

    return { log, updated };
  });

  return { message: 'Outbound registered', currentStock: result.updated.currentStock };
};
