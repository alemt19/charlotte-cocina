import { prisma } from '../db/client.js';

const registerShift = async (staffId, type) => {
    try {
        if (type === 'CHECK_IN') {
            const existingShift = await prisma.staffShift.findFirst({
            where: {
                staffId,
                shiftEnd: null,
        },
        orderBy: { shiftStart: 'desc' },
        });

        if (existingShift) {
            throw new Error('Ya existe un turno abierto para este staff. No se puede hacer CHECK_IN nuevamente.');
        }

        return await prisma.staffShift.create({
            data: {
            staffId,
            shiftStart: new Date(),
            isPresent: true,
        },
        });
    }

    if (type === 'CHECK_OUT') {
        const lastShift = await prisma.staffShift.findFirst({
            where: {
                staffId,
                shiftEnd: null,
        },
        orderBy: { shiftStart: 'desc' },
        });

        if (!lastShift) {
            throw new Error('No hay turno abierto para cerrar.');
        }

        return await prisma.staffShift.update({
            where: { id: lastShift.id },
            data: { shiftEnd: new Date() },
        });
    }
    } catch (error) {
        console.error('Error en registerShift service:', error);
        throw error;
    }
};

const getShiftHistory = async (staffId, startDate, endDate) => {
    try {
        const shifts = await prisma.staffShift.findMany({
            where: {
                staffId,
                shiftStart: { gte: startDate ? new Date(startDate) : undefined },
                shiftEnd: { lte: endDate ? new Date(endDate) : undefined },
        },
        orderBy: { shiftStart: 'asc' },
    });

    return shifts.map(shift => {
        const start = shift.shiftStart;
        const end = shift.shiftEnd || new Date();
        const durationHours = (end - start) / (1000 * 60 * 60);

        return {
            id: shift.id,
            shiftStart: start,
            shiftEnd: shift.shiftEnd,
            durationHours: Number(durationHours.toFixed(2)),
        };
    });
    } catch (error) {
        console.error('Error en getShiftHistory service:', error);
        throw error;
    }
};

export { registerShift, getShiftHistory };