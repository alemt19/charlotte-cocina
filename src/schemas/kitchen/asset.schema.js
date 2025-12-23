import { z } from 'zod';

export const createAssetSchema = z.object({
  name: z.string().min(1),
  totalQuantity: z.number().int().nonnegative().optional(),
  status: z.enum(['OPERATIONAL', 'UNDER_MAINTENANCE', 'DAMAGED', 'LOST']).optional(),
  lastAuditDate: z.string().optional(), // ISO date string
  notes: z.string().optional()
});

export const updateAssetSchema = z.object({
  name: z.string().min(1).optional(),
  totalQuantity: z.number().int().nonnegative().optional(),
  status: z.enum(['OPERATIONAL', 'UNDER_MAINTENANCE', 'DAMAGED', 'LOST']).optional(),
  lastAuditDate: z.string().optional(),
  notes: z.string().optional()
});

export const listAssetsSchema = z.object({
  status: z.enum(['OPERATIONAL', 'UNDER_MAINTENANCE', 'DAMAGED', 'LOST']).optional()
});

export default { createAssetSchema, updateAssetSchema, listAssetsSchema };
