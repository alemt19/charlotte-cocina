import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INGREDIENT', 'PACKAGING']),
  unitMeasure: z.enum(['KG', 'G', 'L', 'ML', 'UNIT']),
  minStockAlert: z.number().nonnegative()
});

export const listItemsSchema = z.object({
  type: z.enum(['INGREDIENT', 'PACKAGING']).optional(),
  stockStatus: z.enum(['LOW', 'OK']).optional()
});

export const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  minStockAlert: z.number().nonnegative().optional(),
  unitMeasure: z.enum(['KG', 'G', 'L', 'ML', 'UNIT']).optional()
});

export const inboundSchema = z.object({
  itemId: z.string().uuid(),
  quantityChange: z.number().positive(),
  costAtTime: z.number().nonnegative(),
  movementType: z.enum(['PURCHASE', 'RETURN_RESTOCK', 'ADJUSTMENT']),
  reason: z.string().min(1),
  staffId: z.string().uuid().optional(),
});

export const outboundSchema = z.object({
  itemId: z.string().uuid(),
  quantityChange: z.number().positive(),
  movementType: z.enum(['WASTE', 'ADJUSTMENT', 'SALE']),
  reason: z.string().min(1),
  staffId: z.string().uuid().optional(),
});

export default {
  createItemSchema,
  listItemsSchema
};
