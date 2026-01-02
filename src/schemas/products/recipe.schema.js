import { z } from 'zod';

export const createRecipeSchema = z.object({
  body: z.object({
    productId: z.string().uuid('El productId debe ser un UUID válido'),
    inventoryItemId: z.string().uuid('El inventoryItemId debe ser un UUID válido'),
    quantityRequired: z.number({
      required_error: 'quantityRequired es obligatorio',
      invalid_type_error: 'quantityRequired debe ser un número',
    }).positive('quantityRequired debe ser mayor a 0'),
    applyOn: z.enum(['ALL', 'DINE_IN', 'TAKEOUT', 'DELIVERY', 'PICKUP']).optional(),
  }),
});
