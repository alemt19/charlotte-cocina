import { z } from 'zod';

export const registerShiftSchema = z.object({
    type: z.enum(['CHECK_IN', 'CHECK_OUT']),
});

export const getShiftHistorySchema = z.object({
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
});