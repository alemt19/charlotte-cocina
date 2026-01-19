import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    basePrice: z.number().positive(),
    categoryId: z.string().uuid(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional().default(true)
  })
});

export const getProductsQuerySchema = z.object({
  query: z.object({
    activeOnly: z.enum(['true', 'false']).optional(),
    categoryId: z.string().uuid().optional()
  })
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial()
});

export const productStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean()
  })
});