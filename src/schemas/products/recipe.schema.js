import { z } from 'zod';

export const createRecipeSchema = z.object({
  body: z.object({
    product_id: z.string().uuid(),
    inventory_item_id: z.string().uuid(),
    quantity_required: z.number().positive(),
    apply_on: z.enum(['DINE_IN', 'DELIVERY', 'TAKEOUT', 'PICKUP', 'ALL'])
  })
});