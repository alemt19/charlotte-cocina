// src/services/category.service.js
import { prisma } from '../db/client.js';

const findCategories = async (query) => {
  try {
    // CAMBIO: Desestructuramos usando camelCase 'activeOnly'
    const { activeOnly } = query;

    const whereClause = activeOnly === 'true' ? { isActive: true } : {};

    const categories = await prisma.kitchenCategory.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        isActive: true
      }
    });

    return categories;

  } catch (error) {
    // NUEVA REGLA: Manejo de errores dentro del servicio
    console.error("Error en category.service.js (findCategories):", error);
    throw error; // Lanzamos el error para que el controlador responda con 500
  }
};

const createCategory = async (data) => {
  try {
    const newCategory = await prisma.kitchenCategory.create({
      data: {
        name: data.name.trim(),
      },
      select: {
        id: true,
        name: true,
        isActive: true
      }
    });
    return newCategory;

  } catch (error) {
    // NUEVA REGLA: Manejo de errores dentro del servicio
    console.error("Error en category.service.js (createCategory):", error);
    throw error;
  }
};

export default {
  findCategories,
  createCategory,
};