import { prisma } from '../../db/client.js';

const getProducts = async ({ activeOnly, categoryId } = {}) => {
  const where = {};
  
  if (activeOnly) {
    where.isActive = true;
  }
  
  if (categoryId) {
    where.categoryId = categoryId;
  }

  return await prisma.kitchenProduct.findMany({
    where,
    include: {
      category: true
    },
    orderBy: {
      name: 'asc'
    }
  });
};

const getProductById = async (id) => {
  const cleanId = id.trim();
  const product = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId },
    include: {
      category: true,
      recipes: {
        include: {
          inventoryItem: true 
        }
      }
    }
  });
  
  if (!product) throw new Error("NOT_FOUND");
  return product;
};

const createProduct = async (data) => {
  let finalImageUrl = null;

  if (data.imageFile) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    finalImageUrl = `${appUrl}/public/uploads/${data.imageFile.filename}`;
  } else if (data.imageUrl) {
    finalImageUrl = data.imageUrl;
  }

  const prismaData = {
    name: data.name,
    description: data.description,
    basePrice: data.basePrice,
    imageUrl: finalImageUrl,
    isActive: data.isActive !== undefined ? data.isActive : true,
    category: {
      connect: { id: data.categoryId }
    }
  };

  return await prisma.kitchenProduct.create({
    data: prismaData
  });
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

const toggleProductStatus = async (id, isActive) => {
  return await prisma.kitchenProduct.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, isActive: true }
  });
};

const getProductRecipe = async (id) => {
  const cleanId = id.trim();
  return await prisma.recipe.findMany({
    where: { productId: cleanId },
    include: { inventoryItem: true }
  });
};

const checkProductAvailability = async (id) => {
  const cleanId = id.trim();

  const product = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId },
    include: { recipes: { include: { inventoryItem: true } } }
  });

  if (!product) throw new Error("NOT_FOUND");

  if (!product.isActive) {
    return {
      productId: product.id,
      status: "UNAVAILABLE",
      reason: "Producto desactivado manualmente",
      missingItems: []
    };
  }

  const missingItems = [];

  for (const recipe of product.recipes) {
    const required = recipe.quantityRequired;
    const currentStock = recipe.inventoryItem?.currentStock || 0; 

    if (currentStock < required) {
      missingItems.push(
        `${recipe.inventoryItem?.name} (Faltan ${required - currentStock} ${recipe.inventoryItem?.unitMeasure})`
      );
    }
  }

  if (missingItems.length > 0) {
    return {
      productId: product.id,
      status: "UNAVAILABLE",
      reason: "Stock insuficiente",
      missingItems: missingItems
    };
  }

  return {
    productId: product.id,
    status: "AVAILABLE",
    reason: "OK",
    stockAlert: null,
    missingItems: []
  };
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductRecipe,
  checkProductAvailability
};