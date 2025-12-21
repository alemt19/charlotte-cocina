import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INGREDIENT', 'PACKAGING']),
  unit_measure: z.enum(['KG', 'G', 'L', 'ML', 'UNIT']),
  min_stock_alert: z.number().nonnegative()
});

export const listItemsSchema = z.object({
  type: z.enum(['INGREDIENT', 'PACKAGING']).optional(),
  stock_status: z.enum(['LOW', 'OK']).optional()
});

export default {
  createItemSchema,
  listItemsSchema
};
