import prisma from '../db/client.js';

const getProducts = async () => {
  return await prisma.kitchenProduct.findMany({
    include: {
      category: true 
    }
  });
};

const getProductById = async (id) => {
  const cleanId = id.trim();
  const product = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId },
    include: {
      recipes: true 
    }
  });
  
  if (!product) throw new Error("NOT_FOUND");
  return product;
};

const createProduct = async (data) => {
  return await prisma.kitchenProduct.create({ data });
};

const updateProduct = async (id, data) => {
  const cleanId = id.trim();

  const exists = await prisma.kitchenProduct.findUnique({ where: { id: cleanId } });
  if (!exists) throw new Error("NOT_FOUND");

  return await prisma.kitchenProduct.update({
    where: { id: cleanId },
    data: data
  });
};

const deleteProduct = async (id) => {
  const cleanId = id.trim();
  const exists = await prisma.kitchenProduct.findUnique({ where: { id: cleanId } });
  if (!exists) throw new Error("NOT_FOUND");

  return await prisma.kitchenProduct.delete({
    where: { id: cleanId }
  });
};

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