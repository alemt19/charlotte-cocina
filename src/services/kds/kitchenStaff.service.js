import { is } from 'zod/locales';
import { prisma } from '../../db/client.js';
import axios from 'axios';

const EXTERNAL_USERS_API = 'https://charlotte-seguridad.onrender.com/api/seguridad/users';

const generatePin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const getAllKitchenStaff = async (token) => {
    try {
        const localStaff = await prisma.kitchenStaff.findMany({
            orderBy: { id: 'desc' }
        });

        const externalUsersResponse = await axios.get(EXTERNAL_USERS_API, {
            headers: { Authorization: token }
        });
        const externalUsers = externalUsersResponse.data;

        return localStaff.map(staff => {
            const user = externalUsers.find(u => u.id === staff.userId);
            const { workerCode, ...safeStaff } = staff;
            return {
                ...safeStaff,
                externalName: user ? `${user.name} ${user.lastName}` : 'Usuario Desconocido',
                externalEmail: user ? user.email : 'N/A',
                externalRole: user ? user.rol : 'N/A'
            };
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
        const existingStaff = await prisma.kitchenStaff.findUnique({
             where: { userId: data.userId }
        });

        if (existingStaff) {
             throw new Error('El usuario ya está asignado al personal de cocina.');
        }

        let pin = generatePin();
        let isUnique = false;
        let attempts = 0;
        
        while(!isUnique && attempts < 10) {
             const check = await prisma.kitchenStaff.findUnique({ where: { workerCode: pin }});
             if(!check) {
                isUnique = true;
             } else {
                pin = generatePin();
                attempts++;
             }
        }
        
        if (!isUnique) throw new Error("No se pudo generar un PIN único, intente nuevamente.");

        return await prisma.kitchenStaff.create({
            data: {
                userId: data.userId,
                workerCode: pin,
                role: data.role,
                isActive: true
            },
        });
    } catch (error) {
        console.error('Error en createKitchenStaff:', error);
        throw error;
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

const regenerateWorkerCode = async (id) => {
     let pin = generatePin();
     let isUnique = false;
     let attempts = 0;
     while(!isUnique && attempts < 10) {
          const check = await prisma.kitchenStaff.findUnique({ where: { workerCode: pin }});
          if(!check) isUnique = true;
          else {
            pin = generatePin();
            attempts++;
          }
     }
     
     if (!isUnique) throw new Error("No se pudo generar un PIN único.");

     const updated = await prisma.kitchenStaff.update({
          where: { id },
          data: { workerCode: pin }
     });
     
     return updated.workerCode;
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
    validateWorkerCode,
    regenerateWorkerCode
};
