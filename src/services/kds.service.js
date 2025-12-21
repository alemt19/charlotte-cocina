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

export { injectOrder };