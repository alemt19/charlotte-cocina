import { prisma } from '../db/client.js';
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
                notes: item.notes,
        },
        });
        createdTasks.push(task);

        const recipe = await tx.recipe.findMany({
            where: {
                productId: item.productId,
                scope: serviceMode,
        },
        include: { ingredients: true },
        });

        for (const r of recipe) {
            for (const ingredient of r.ingredients) {
                try {
                    await axios.post('http://localhost:3000/api/kitchen/inventory/outbound', {
                    itemId: ingredient.itemId,
                    quantity: ingredient.quantity * item.quantity,
                    reason: 'ORDER_INJECTION',
                    sourceModule,
            });
            } catch (error) {
                throw new Error(`Fallo al descontar inventario del item ${ingredient.itemId}`);
            }
        }
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
        select: {
            id: true,
            externalOrderId: true,
            productId: true,
            quantity: true,
            preparationNotes: true,
            status: true,
            priorityLevel: true,
            createdAt: true,
        },
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

export { injectOrder, getQueueTasks, assignTask, updateTaskStatus };