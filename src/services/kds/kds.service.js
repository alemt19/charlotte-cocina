import { envs } from '../../config/envs.js';
import { prisma } from '../../db/client.js';
import axios from 'axios';

const normalizeAuthorizationHeader = (authorization) => {
    if (!authorization || typeof authorization !== 'string') return null;
    const trimmed = authorization.trim();
    if (!trimmed) return null;

    if (/^bearer\s+/i.test(trimmed)) return trimmed;
    return `Bearer ${trimmed}`;
};

const axiosAuthConfig = (authorization) => {
    const header = normalizeAuthorizationHeader(authorization);
    if (!header) return {};
    return { headers: { Authorization: header } };
};

const getInventoryCostAtTime = async (itemId) => {
    const item = await prisma.inventoryItem.findUnique({
        where: { id: itemId },
        select: { averageCost: true },
    });

    return Number(item?.averageCost ?? 0);
};

const rollbackInventoryForTask = async (task, authorization) => {
    if (!task) return;

    const recipeRows = await prisma.recipe.findMany({
        where: { productId: task.productId },
        select: {
            inventoryItemId: true,
            quantityRequired: true,
            applyOn: true,
        },
    });

    if (!recipeRows.length) return;

    for (const r of recipeRows) {
        if (r.applyOn !== 'ALL' && r.applyOn !== task.serviceMode) continue;

        const costAtTime = await getInventoryCostAtTime(r.inventoryItemId);

        await axios.post(`${envs.API_URL}/api/kitchen/inventory/inbound`, {
            itemId: r.inventoryItemId,
            quantityChange: Number(r.quantityRequired) * Number(task.quantity),
            costAtTime,
            movementType: 'RETURN_RESTOCK',
            reason: `Rollback por rechazo/cancelación - orden ${task.externalOrderId} - producto ${task.productId}`,
        }, axiosAuthConfig(authorization));
    }
};

const mapKdsStatusToAtencionClienteStatus = (kdsStatus) => {
    switch (kdsStatus) {
        case 'PENDING':
            return 'PENDING';
        case 'COOKING':
            return 'COOKING';
        case 'READY':
        case 'SERVED':
            return 'DELIVERED';
        case 'REJECTED':
            return 'CANCELLED';
        default:
            return null;
    }
};

const mapKdsStatusToDeliveryPickupStatus = (kdsStatus) => {
    switch (kdsStatus) {
        case 'COOKING':
            return 'IN_KITCHEN';
        case 'READY':
            return 'READY_FOR_DISPATCH';
        case 'REJECTED':
            return 'CANCELLED';
        default:
            return null;
    }
};

const notifyExternalModuleOrderStatus = async ({ sourceModule, externalOrderId, kdsStatus, authorization }) => {
    try {
        if (!sourceModule || !externalOrderId || !kdsStatus) return;

        if (sourceModule === 'AC_MODULE') {
            const status = mapKdsStatusToAtencionClienteStatus(kdsStatus);
            if (!status) return;

            await axios.patch(
                `${envs.ATENCION_CLIENTE_API_URL}/api/v1/atencion-cliente/comandas/${externalOrderId}`,
                { status },
                axiosAuthConfig(authorization)
            );
            return;
        }

        if (sourceModule === 'DP_MODULE') {
            const status = mapKdsStatusToDeliveryPickupStatus(kdsStatus);
            if (!status) return;

            await axios.patch(
                `${envs.DELIVERY_PICKUP_API_URL}/api/dp/v1/orders/${externalOrderId}/status`,
                { status },
                axiosAuthConfig(authorization)
            );
        }
    } catch (error) {
        const errMsg = error.response?.data?.message || error.response?.data?.error || error.message;
        console.error(`Error notificando módulo externo (${sourceModule}) para orden ${externalOrderId}: ${errMsg}`);
    }
};

const notifyIfOrderFullyInStatus = async ({ externalOrderId, sourceModule, targetStatus, authorization }) => {
    if (!externalOrderId || !sourceModule || !targetStatus) return;

    const tasks = await prisma.kdsProductionQueue.findMany({
        where: { externalOrderId },
        select: { status: true },
    });

    if (!tasks.length) return;
    const allInTarget = tasks.every((t) => t.status === targetStatus);
    if (!allInTarget) return;

    await notifyExternalModuleOrderStatus({ sourceModule, externalOrderId, kdsStatus: targetStatus, authorization });
};

const injectOrder = async (orderData, authorization) => {
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
                const missingItems = data.missingItems || data.missing_items;
                const missing = missingItems && missingItems.length > 0 
                    ? `: ${missingItems.join(', ')}` 
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
                }, axiosAuthConfig(authorization));
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
            include: {
                waiter: true, // Includes KitchenStaff relation
                chef: true,
            }
        });

        const productIds = [...new Set(tasks.map(t => t.productId))];

        const products = await prisma.kitchenProduct.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
        });

        const productMap = Object.fromEntries(products.map(p => [p.id, p]));

        // OPTIONAL: If we had a bulk user fetcher, we would do it here using tasks.map(t => t.waiter?.userId)
        
        const tasksWithProduct = tasks.map(task => {
            const t = {
                ...task,
                product: productMap[task.productId] || null,
            };

            return t;
        });

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

const updateTaskStatus = async (taskId, newStatus, authorization) => {
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

        // Notificamos SOLO cuando el estado de la ORDEN completa cambió (todas las tareas con el mismo externalOrderId)
        // quedaron en el mismo estado.
        await notifyIfOrderFullyInStatus({
            externalOrderId: updatedTask.externalOrderId,
            sourceModule: updatedTask.sourceModule,
            targetStatus: newStatus,
            authorization,
        });

        return updatedTask;
    } catch (error) {
        console.error('Error en updateTaskStatus:', error);
        throw error;
    }
};

export const markTaskServed = async (taskId, staffId, authorization) => {
    const task = await prisma.kdsProductionQueue.findUnique({ where: { id: taskId } });
        if (!task) throw new Error('Tarea no encontrada');
            if (!['DINE_IN', 'TAKEOUT'].includes(task.serviceMode)) {
                throw new Error('Modo de servicio incompatible');
    }

        const updated = await prisma.kdsProductionQueue.update({
            where: { id: taskId },
            data: { status: 'SERVED', assignedWaiterId: staffId },
    });

        await notifyIfOrderFullyInStatus({
            externalOrderId: updated.externalOrderId,
            sourceModule: updated.sourceModule,
            targetStatus: 'SERVED',
            authorization,
        });

        return updated;
};

export const rejectTask = async (taskId, authorization) => {
        const task = await prisma.kdsProductionQueue.findUnique({ where: { id: taskId } });
            if (!task) throw new Error('Tarea no encontrada');
                if (task.status === 'SERVED') throw new Error('No se puede anular una tarea servida');

        // Evita rollback doble si ya está rechazada.
        if (task.status === 'REJECTED') return task;

        // Primero hacemos rollback del inventario; si falla, no cambiamos el estado.
        await rollbackInventoryForTask(task, authorization);

        const updated = await prisma.kdsProductionQueue.update({
            where: { id: taskId },
            data: { status: 'REJECTED' },
        });

        await notifyIfOrderFullyInStatus({
            externalOrderId: updated.externalOrderId,
            sourceModule: updated.sourceModule,
            targetStatus: 'REJECTED',
            authorization,
        });

        return updated;
};

export const cancelExternalOrder = async (externalId, authorization) => {
    const tasks = await prisma.kdsProductionQueue.findMany({ where: { externalOrderId: externalId } });
    if (!tasks.length) throw new Error('No hay tareas para esa orden');

    // Rollback inventario para todas las tareas que aún no estén REJECTED.
    const tasksToRollback = tasks.filter((t) => t.status !== 'REJECTED');

    if (tasksToRollback.length) {
        const productIds = [...new Set(tasksToRollback.map((t) => t.productId))];
        const recipes = await prisma.recipe.findMany({
            where: { productId: { in: productIds } },
            select: {
                productId: true,
                inventoryItemId: true,
                quantityRequired: true,
                applyOn: true,
            },
        });

        const recipesByProductId = recipes.reduce((acc, r) => {
            acc[r.productId] = acc[r.productId] || [];
            acc[r.productId].push(r);
            return acc;
        }, {});

        for (const task of tasksToRollback) {
            const recipeRows = recipesByProductId[task.productId] || [];
            if (!recipeRows.length) continue;

            for (const r of recipeRows) {
                if (r.applyOn !== 'ALL' && r.applyOn !== task.serviceMode) continue;

                const costAtTime = await getInventoryCostAtTime(r.inventoryItemId);

                await axios.post(`${envs.API_URL}/api/kitchen/inventory/inbound`, {
                    itemId: r.inventoryItemId,
                    quantityChange: Number(r.quantityRequired) * Number(task.quantity),
                    costAtTime,
                    movementType: 'RETURN_RESTOCK',
                    reason: `Rollback por cancelación - orden ${task.externalOrderId} - producto ${task.productId}`,
                }, axiosAuthConfig(authorization));
            }
        }
    }

    const cancelled = await prisma.$transaction(async (tx) => {
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

    // Para cancelación, ya garantizamos que toda la orden quedó REJECTED.
    await notifyExternalModuleOrderStatus({
        sourceModule: tasks[0].sourceModule,
        externalOrderId: externalId,
        kdsStatus: 'REJECTED',
        authorization,
    });

    return cancelled;
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