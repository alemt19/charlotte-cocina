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

export const listAssets = async ({ status, lastAuditBefore } = {}) => {
  const where = {};
  if (status) where.status = status;
  if (lastAuditBefore) {
    const date = new Date(lastAuditBefore);
    if (!isNaN(date.getTime())) {
      where.lastAuditDate = { lt: date };
    }
  }
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

export const registerAssetLog = async ({ assetId, quantityChange, reason, reportedBy }) => {
  // Validate kitchen staff exists
  const staff = await prisma.kitchenStaff.findUnique({ where: { id: reportedBy } });
  if (!staff) {
    const err = new Error('KitchenStaff not found');
    err.code = 'KITCHENSTAFF_NOT_FOUND';
    throw err;
  }

  // Use transaction to create log and update asset quantity
  const result = await prisma.$transaction(async (tx) => {
    const log = await tx.assetLog.create({
      data: {
        assetId,
        quantityChange: Number(quantityChange),
        reason,
        reportedBy
      }
    });

    const asset = await tx.kitchenAsset.findUnique({ where: { id: assetId } });
    if (!asset) {
      const err = new Error('Asset not found');
      err.code = 'ASSET_NOT_FOUND';
      throw err;
    }

    const newTotal = (asset.totalQuantity || 0) + Number(quantityChange);

    const updated = await tx.kitchenAsset.update({ where: { id: assetId }, data: { totalQuantity: newTotal } });

    return { log, updated };
  });

  return result;
};

