import prisma from '../db/client.js';

const getProducts = async () => {
  // CAMBIO: Usamos kitchenProduct
  return await prisma.kitchenProduct.findMany();
};

const createProduct = async (data) => {
  return await prisma.kitchenProduct.create({ data });
};

const updateProduct = async (id, data) => {
  return await prisma.kitchenProduct.update({
    where: { id },
    data
  });
};

const deleteProduct = async (id) => {
  return await prisma.kitchenProduct.delete({
    where: { id }
  });
};

// --- FUNCIÓN DEL ENDPOINT 6 (CORREGIDA) ---
const toggleProductStatus = async (id, isActiveValue) => {
  const cleanId = id.trim();

  // 1. Verificamos si existe (usando kitchenProduct)
  const productExists = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId }
  });

  if (!productExists) {
    throw new Error("NOT_FOUND");
  }

  // 2. Actualizamos
  return await prisma.kitchenProduct.update({
    where: { id: cleanId },
    data: {
      isActive: isActiveValue
    }
  });
};
// Función para buscar un producto por su ID (Endpoint 7)
const getProductById = async (id) => {
  return await prisma.kitchenProduct.findUnique({
    where: { id },
    include: {
      category: true, // Trae la categoría
      recipes: {      // Trae las recetas
        include: {
          inventoryItem: true // Trae el nombre del insumo dentro de la receta
        }
      }
    }
  });
};
export default {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductById,
};