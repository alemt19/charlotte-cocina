import { prisma } from '../db/client.js';

const getAllKitchenStaff = async () => {
    return prisma.kitchenStaff.findMany({
        where: { isActive: true },
    });
};

const getKitchenStaffById = async (id) => {
    return prisma.kitchenStaff.findUnique({
        where: { id },
    });
};

const createKitchenStaff = async (data) => {
    return prisma.kitchenStaff.create({
        data: {
            userId: data.userId,
            workerCode: data.workerCode,
            role: data.role,
    },
    });
};

const updateKitchenStaff = async (id, data) => {
    return prisma.kitchenStaff.update({
        where: { id },
        data,
    });
};

const deleteKitchenStaff = async (id) => {
    return prisma.kitchenStaff.update({
        where: { id },
        data: { isActive: false },
    });
};

export { getAllKitchenStaff, getKitchenStaffById, createKitchenStaff, updateKitchenStaff, deleteKitchenStaff };