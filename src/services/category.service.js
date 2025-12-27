import prisma from '../db/client.js';

const getProducts = async () => {
  return await prisma.kitchenProduct.findMany({
    include: {
      category: true 
    }
  });
};

// --- ENDPOINT 7: Obtener Producto por ID ---
const getProductById = async (id) => {
  const cleanId = id.trim();
  
  const product = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId },
    include: {
      category: true, // Trae info de la categoría
      recipes: {      // Trae la receta
        include: {
          inventoryItem: true // Trae el nombre real del insumo
        }
      }
    }
  });

  if (!product) {
    throw new Error("NOT_FOUND");
  }

  return product;
};

const createProduct = async (data) => {
  return await prisma.kitchenProduct.create({ data });
};

// --- ENDPOINT 8: Actualizar Producto ---
const updateProduct = async (id, data) => {
  const cleanId = id.trim();

  // 1. Verificamos si existe antes de intentar actualizar
  const exists = await prisma.kitchenProduct.findUnique({ where: { id: cleanId } });
  if (!exists) throw new Error("NOT_FOUND");

  // 2. Actualizamos
  return await prisma.kitchenProduct.update({
    where: { id: cleanId },
    data: data
  });
};

const deleteProduct = async (id) => {
  const cleanId = id.trim();
  // Verificamos existencia primero para lanzar el error correcto
  const exists = await prisma.kitchenProduct.findUnique({ where: { id: cleanId } });
  if (!exists) throw new Error("NOT_FOUND");

  return await prisma.kitchenProduct.delete({
    where: { id: cleanId }
  });
};

// Endpoint 6 (Toggle)
const toggleProductStatus = async (id, isActiveValue) => {
  const cleanId = id.trim();
  const productExists = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId }
  });

  if (!productExists) {
    throw new Error("NOT_FOUND");
  }

  return await prisma.kitchenProduct.update({
    where: { id: cleanId },
    data: {
      isActive: isActiveValue
    }
  });
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
};