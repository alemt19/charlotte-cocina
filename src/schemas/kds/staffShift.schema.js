import { z } from 'zod';

export const registerShiftSchema = z.object({
    type: z.enum(['CHECK_IN', 'CHECK_OUT']),
});

export const getShiftHistorySchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});