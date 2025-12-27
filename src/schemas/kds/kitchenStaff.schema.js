import { z } from 'zod';

export const createKitchenStaffSchema = z.object({
    userId: z.string().uuid({ message: 'El userId debe ser un UUID válido' }),
    workerCode: z.string().min(3, { message: 'El código debe tener al menos 3 caracteres' }),
    role: z.enum(['CHEF', 'ASISTENTE', 'LIMPIEZA'], { message: 'Rol inválido' }),
});

export const updateKitchenStaffSchema = z.object({
    userId: z.string().uuid().optional(),
    workerCode: z.string().min(3).optional(),
    role: z.enum(['CHEF', 'ASISTENTE', 'LIMPIEZA']).optional(),
    isActive: z.boolean().optional(),
});

export const idSchema = z.object({
    id: z.string().uuid({ message: 'ID inválido' }),
});