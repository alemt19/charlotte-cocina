import { prisma } from '../db/client.js';

// 1. Obtener categorías
const findCategories = async (query) => {
  try {
    const { activeOnly } = query || {};
    const whereClause = activeOnly === 'true' ? { isActive: true } : {};

    return await prisma.kitchenCategory.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        isActive: true
      }
    });
  } catch (error) {
    console.error("Error en findCategories:", error);
    throw error;
  }
};

// 2. Crear categoría
const createCategory = async (data) => {
  try {
    return await prisma.kitchenCategory.create({
      data: {
        name: data.name.trim(),
        isActive: true
      },
      select: {
        id: true,
        name: true,
        isActive: true
      }
    });
  } catch (error) {
    console.error("Error en createCategory:", error);
    throw error;
  }
};

// 3. Actualizar categoría
const updateCategory = async (id, data) => {
  try {
    // A. Verificar si existe la categoría (ID es texto/UUID)
    const existing = await prisma.kitchenCategory.findUnique({
      where: { id: id }
    });

    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    // B. Preparar datos para actualizar
    const dataToUpdate = {};
    if (data.name !== undefined) dataToUpdate.name = data.name.trim();
    // Si envían is_active, lo usamos. Si no, mantenemos el que ya tenía.
    if (data.is_active !== undefined) dataToUpdate.isActive = data.is_active;

    // C. Actualizar en Base de Datos
    const updated = await prisma.kitchenCategory.update({
      where: { id: id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        isActive: true
      }
    });

    return updated;

  } catch (error) {
    console.error("Error en updateCategory:", error);
    throw error;
  }
};

// Exportación final (necesaria para que el controlador lo vea)
// 4. Eliminar categoría
const deleteCategory = async (id) => {
  try {
    // A. Verificar si existe
    const existing = await prisma.kitchenCategory.findUnique({
      where: { id: id }
    });

    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    // B. Eliminar
    return await prisma.kitchenCategory.delete({
      where: { id: id }
    });

  } catch (error) {
    // Tip: Si hay productos vinculados a esta categoría, Prisma lanzará un error aquí.
    console.error("Error en deleteCategory:", error);
    throw error;
  }
};
export default {
  findCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};