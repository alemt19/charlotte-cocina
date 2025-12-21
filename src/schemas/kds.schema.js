import { z } from 'zod';

export const injectOrderSchema = z.object({
    externalOrderId: z.string().uuid(),
    sourceModule: z.enum(['AC_MODULE', 'DP_MODULE']),
    serviceMode: z.enum(['DINE_IN', 'DELIVERY', 'TAKEOUT']),
    displayLabel: z.string().min(1),
    customerName: z.string().min(1),
    items: z.array(
        z.object({
            productId: z.string().uuid(),
            quantity: z.number().int().positive(),
            notes: z.string().optional(),
    })
    ).min(1),
});