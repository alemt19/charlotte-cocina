import { prisma } from '../../db/client.js';

const getAllKitchenStaff = async () => {
    try {
        return await prisma.kitchenStaff.findMany({
            where: { isActive: true },
    });
    } catch (error) {
    console.error('Error en getAllKitchenStaff:', error);
    throw new Error('No se pudo obtener la lista de KitchenStaff.');
    }
};

const getKitchenStaffById = async (id) => {
    try {
        return await prisma.kitchenStaff.findUnique({
            where: { id },
    });
    } catch (error) {
    console.error(`Error en getKitchenStaffById con id ${id}:`, error);
    throw new Error(`No se pudo obtener el KitchenStaff con id ${id}.`);
    }
};

const createKitchenStaff = async (data) => {
    try {
        
        const existingStaff = await prisma.kitchenStaff.findFirst({
            where: {
                OR: [
                    { workerCode: data.workerCode },
                    { userId: data.userId }
                ]
            },
        });

        if (existingStaff) {
            throw new Error('Ya existe un KitchenStaff con el mismo workerCode o userId.');
        }

        return await prisma.kitchenStaff.create({
            data: {
                userId: data.userId,
                workerCode: data.workerCode,
                role: data.role,
        },
    });
    } catch (error) {

        if (error.message.includes('Ya existe un KitchenStaff')) {
            throw error;
        }
    console.error('Error en createKitchenStaff:', error);
    throw new Error('No se pudo crear el KitchenStaff. Revisa los datos enviados.');
    }
};

const updateKitchenStaff = async (id, data) => {
    try {
        return await prisma.kitchenStaff.update({
            where: { id },
            data,
    });
    } catch (error) {
    console.error(`Error en updateKitchenStaff con id ${id}:`, error);
    throw new Error(`No se pudo actualizar el KitchenStaff con id ${id}.`);
    }
};

const deleteKitchenStaff = async (id) => {
    try {
        return await prisma.kitchenStaff.update({
            where: { id },
            data: { isActive: false },
        });
    } catch (error) {
        console.error(`Error en deleteKitchenStaff con id ${id}:`, error);
        throw new Error(`No se pudo eliminar (soft delete) el KitchenStaff con id ${id}.`);
    }
};

const getActiveKitchenStaff = async () => {
    try {
        const staff = await prisma.kitchenStaff.findMany({
        where: { isActive: true },
        include: {
            shifts: {
                where: {
                    shiftEnd: null,
            },
        },
        },
    });

        return staff;
    } catch (error) {
        console.error('Error en getActiveKitchenStaff:', error);
        throw error;
    }
};

const validateWorkerCode = async (workerCode) => {
    try {
        const staff = await prisma.kitchenStaff.findUnique({
            where: { workerCode },
        });

        if (!staff) {
            throw new Error('Código de trabajador inválido.');
        }

        if (!staff.isActive) {
            throw new Error('El trabajador no está activo.');
        }

        return staff; // Returns the staff object (id, role, etc.)
    } catch (error) {
        console.error('Error en validateWorkerCode:', error);
        throw error; // Rethrow to be handled by controller
    }
};

export {
    getAllKitchenStaff,
    getKitchenStaffById,
    createKitchenStaff,
    updateKitchenStaff,
    deleteKitchenStaff,
    getActiveKitchenStaff,
    validateWorkerCode
};
