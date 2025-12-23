import { prisma } from '../../db/client.js';

export const createAsset = async ({ name, totalQuantity = 0, status = 'OPERATIONAL', lastAuditDate = null, notes = null }) => {
  const data = {
    name,
    totalQuantity,
    status,
    lastAuditDate: lastAuditDate ? new Date(lastAuditDate) : null,
    notes
  };

  return await prisma.kitchenAsset.create({ data });
};

export const listAssets = async ({ status } = {}) => {
  const where = {};
  if (status) where.status = status;
  return await prisma.kitchenAsset.findMany({ where });
};

export const getAssetById = async (id) => {
  return await prisma.kitchenAsset.findUnique({ where: { id } });
};

export const updateAsset = async (id, updates) => {
  const data = {};
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.totalQuantity !== undefined) data.totalQuantity = updates.totalQuantity;
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.lastAuditDate !== undefined) data.lastAuditDate = updates.lastAuditDate ? new Date(updates.lastAuditDate) : null;
  if (updates.notes !== undefined) data.notes = updates.notes;

  return await prisma.kitchenAsset.update({ where: { id }, data });
};
