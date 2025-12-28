import { envs } from '../../config/envs.js';
import { prisma } from '../../db/client.js';
import axios from 'axios';

const injectOrder = async (orderData) => {
    const {
        externalOrderId,
        sourceModule,
        serviceMode,
        displayLabel,
        customerName,
        items,
    } = orderData;

    for (const item of items) {
        try {
            const { data } = await axios.get(`${envs.API_URL}/api/kitchen/products/${item.productId}/availability`);
            
            if (data.status === 'UNAVAILABLE') {
                const missing = data.missing_items && data.missing_items.length > 0 
                    ? `: ${data.missing_items.join(', ')}` 
                    : '';
                throw new Error(`El producto ${item.productId} no está disponible. Razón: ${data.reason}${missing}`);
            }
        } catch (error) {
            if (error.message && error.message.includes('no está disponible')) {
                throw error;
            }
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            throw new Error(`Error verificando disponibilidad del producto ${item.productId}: ${errorMsg}`);
        }
    }

    return await prisma.$transaction(async (tx) => {
        const productIds = items.map(item => item.productId);
        const existingProducts = await tx.kitchenProduct.findMany({
            where: { id: { in: productIds } },
    });

    if (existingProducts.length !== productIds.length) {
        throw new Error('Uno o más productos no existen en KitchenProduct.');
    }

    const createdTasks = [];
    for (const item of items) {
        const task = await tx.kdsProductionQueue.create({
            data: {
                externalOrderId,
                sourceModule,
                serviceMode,
                displayLabel,
                customerName,
                productId: item.productId,
                quantity: item.quantity,
                preparationNotes: item.notes,
        },
        });
        createdTasks.push(task);

        const recipe = await tx.recipe.findMany({
            where: {
                productId: item.productId,
            },
            include: { inventoryItem: true },
        });
        let deductedCount = 0;

        for (const r of recipe) {
            if (r.applyOn !== "ALL" && r.applyOn !== serviceMode) {
                continue;
            }

            try {
                await axios.post(`${envs.API_URL}/api/kitchen/inventory/outbound`, {
                    itemId: r.inventoryItemId,
                    quantityChange: r.quantityRequired * item.quantity,
                    movementType: 'SALE',
                    reason: `Descuento por orden ${externalOrderId} - producto ${item.productId}`,
                });
                deductedCount++;
            } catch (error) {
                console.error('Error descontando inventario:', error.response?.data || error.message);
                const reason = error.response?.data?.message || error.response?.data?.error || error.message;
                throw new Error(`Fallo al descontar inventario del item ${r.inventoryItemId}: ${reason}`);
            }
        }

        if (recipe.length > 0 && deductedCount === 0) {
            throw new Error(`ERROR: El producto ${item.productId} tiene recetas configuradas, pero ninguna aplica para el modo ${serviceMode}.`);
        }
    }

    return {
        success: true,
        message: 'Orden procesada y stock descontado',
        kdsItemsCount: createdTasks.length,
    };
    });
};

const getQueueTasks = async (status) => {
    try {
        const tasks = await prisma.kdsProductionQueue.findMany({
            where: status ? { status } : {},
            orderBy: [
                { priorityLevel: 'asc' },
                { createdAt: 'asc' },
        ],
    });

        const productIds = [...new Set(tasks.map(t => t.productId))];

        const products = await prisma.kitchenProduct.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
    });

        const productMap = Object.fromEntries(products.map(p => [p.id, p]));

        const tasksWithProduct = tasks.map(task => ({
        ...task,
        product: productMap[task.productId] || null,
    }));

    return tasksWithProduct;
    } catch (error) {
        console.error('Error en getQueueTasks:', error);
        throw error;
    }
};

const assignTask = async (taskId, staffId, role) => {
    try {
        const staff = await prisma.kitchenStaff.findUnique({ where: { id: staffId } });
        if (!staff) throw new Error('El staff_id no existe.');

        let updateData = {};
        if (role === 'CHEF') updateData.assignedChefId = staffId;
        if (role === 'WAITER') updateData.assignedWaiterId = staffId;

        return await prisma.kdsProductionQueue.update({
        where: { id: taskId },
        data: updateData,
    });
    } catch (error) {
    console.error('Error en assignTask:', error);
    throw error;
    }
};

const updateTaskStatus = async (taskId, newStatus) => {
    try {
        const task = await prisma.kdsProductionQueue.findUnique({ where: { id: taskId } });
        if (!task) throw new Error('La tarea no existe.');

        const validTransitions = {
            PENDING: ['COOKING'],
            COOKING: ['READY'],
            READY: [],
    };
        if (!validTransitions[task.status].includes(newStatus)) {
        throw new Error(`Transición inválida de ${task.status} a ${newStatus}.`);
    }

        const updateData = { status: newStatus };
        if (newStatus === 'COOKING') updateData.startedAt = new Date();
        if (newStatus === 'READY') updateData.finishedAt = new Date();

        const updatedTask = await prisma.kdsProductionQueue.update({
        where: { id: taskId },
        data: updateData,
    });

        if (newStatus === 'READY') {
        const allTasks = await prisma.kdsProductionQueue.findMany({
        where: { externalOrderId: updatedTask.externalOrderId },
        });
        const allReady = allTasks.every(t => t.status === 'READY');
        if (allReady) {
            try {
                await axios.post(`http://localhost:3000/api/notify/${updatedTask.sourceModule}`, {
                    orderId: updatedTask.externalOrderId,
                    status: 'READY',
            });
            } catch (error) {
            console.error('Error enviando notificación externa:', error);
            }
        }
    }

        return updatedTask;
    } catch (error) {
        console.error('Error en updateTaskStatus:', error);
        throw error;
    }
};

export const markTaskServed = async (taskId, staffId) => {
    const task = await prisma.kdsProductionQueue.findUnique({ where: { id: taskId } });
        if (!task) throw new Error('Tarea no encontrada');
            if (!['DINE_IN', 'TAKEOUT'].includes(task.serviceMode)) {
                throw new Error('Modo de servicio incompatible');
    }

        return await prisma.kdsProductionQueue.update({
            where: { id: taskId },
            data: { status: 'SERVED', assignedWaiterId: staffId },
    });
};

export const rejectTask = async (taskId) => {
        const task = await prisma.kdsProductionQueue.findUnique({ where: { id: taskId } });
            if (!task) throw new Error('Tarea no encontrada');
                if (task.status === 'SERVED') throw new Error('No se puede anular una tarea servida');

        return await prisma.$transaction(async (tx) => {
            const updated = await tx.kdsProductionQueue.update({
            where: { id: taskId },
            data: { status: 'REJECTED' },
    });

    // Rollback inventario (ejemplo)
    // await axios.post('/api/kitchen/inventory/inbound', { ... });

    // Notificación externa (ejemplo)
    // await axios.post(`/api/notify/${task.sourceModule}`, { orderId: task.externalOrderId, status: 'REJECTED' });

    return updated;
    });
};

export const cancelExternalOrder = async (externalId) => {
    const tasks = await prisma.kdsProductionQueue.findMany({ where: { externalOrderId: externalId } });
    if (!tasks.length) throw new Error('No hay tareas para esa orden');

    return await prisma.$transaction(async (tx) => {
        const cancelled = [];
    for (const task of tasks) {
        const updated = await tx.kdsProductionQueue.update({
        where: { id: task.id },
        data: { status: 'REJECTED' },
        });
        cancelled.push(updated);
    }
    return cancelled;
    });
};

export const getTaskHistory = async (filters) => {
    const { startDate, endDate, chefId, status } = filters;

    return await prisma.kdsProductionQueue.findMany({
        where: {
        ...(status ? { status } : {}),
        ...(chefId ? { assignedChefId: chefId } : {}),
        ...(startDate && endDate
        ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } }
        : {}),
    },
        include: {
        product: { select: { name: true } },
        chef: true,
        waiter: true,
    },
    orderBy: { createdAt: 'desc' },
    });
};

export { injectOrder, getQueueTasks, assignTask, updateTaskStatus };