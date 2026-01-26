import { z } from 'zod';

// Si tus IDs son números, puedes hacer:
export const idSchema = z.object({
    id: z.preprocess(
        (val) => typeof val === "string" ? Number(val) : val,
        z.number().int().positive({ message: 'ID inválido' })
    ),
});

export const uuidSchema = z.object({
    id: z.string().uuid({ message: 'ID inválido' }),
});

export const createKitchenStaffSchema = z.object({
    userId: idSchema.shape.id,
    // workerCode es autogenerado
    role: z.enum(['CHEF', 'WAITER', 'HEAD_CHEF', "HEAD_WAITER"], { message: 'Rol inválido' }),
});

export const updateKitchenStaffSchema = z.object({
    userId: idSchema.shape.id.optional(),
    workerCode: z.string().min(3).optional(),
    role: z.enum(['CHEF', 'WAITER', 'HEAD_CHEF', "HEAD_WAITER"]).optional(),
    isActive: z.boolean().optional(),
});
