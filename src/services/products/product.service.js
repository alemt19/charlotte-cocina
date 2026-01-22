import { envs } from '../../config/envs.js';
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
    const appUrl = envs.APP_URL;
    finalImageUrl = `${appUrl}/api/uploads/${data.imageFile.filename}`;
  } else if (data.imageUrl) {
    finalImageUrl = data.imageUrl;
  }

  return await prisma.kitchenProduct.create({
    data: {
      name: data.name,
      description: data.description,
      basePrice: parseFloat(data.basePrice),
      categoryId: data.categoryId,
      imageUrl: finalImageUrl,
      isActive: data.isActive !== undefined ? data.isActive : true
    }
  });
};

const updateProduct = async (id, data) => {
  const cleanId = id.trim();
  
  const existingProduct = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId }
  });

  if (!existingProduct) throw new Error("NOT_FOUND");

  let finalImageUrl = existingProduct.imageUrl;

  if (data.imageFile) {
    const appUrl = envs.APP_URL;
    finalImageUrl = `${appUrl}/api/uploads/${data.imageFile.filename}`;
  } else if (data.imageUrl) {
    finalImageUrl = data.imageUrl;
  }

  return await prisma.kitchenProduct.update({
    where: { id: cleanId },
    data: {
      name: data.name,
      description: data.description,
      basePrice: data.basePrice ? parseFloat(data.basePrice) : undefined,
      categoryId: data.categoryId,
      imageUrl: finalImageUrl,
      isActive: data.isActive
    }
  });
};

const deleteProduct = async (id) => {
  const cleanId = id.trim();
  
  const product = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId }
  });

  if (!product) throw new Error("NOT_FOUND");

  return await prisma.kitchenProduct.update({
    where: { id: cleanId },
    data: { isActive: false }
  });
};

const toggleProductStatus = async (id) => {
  const cleanId = id.trim();
  
  const product = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId }
  });

  if (!product) throw new Error("NOT_FOUND");

  return await prisma.kitchenProduct.update({
    where: { id: cleanId },
    data: { isActive: !product.isActive }
  });
};

const getProductRecipe = async (id) => {
  const cleanId = id.trim();
  
  const product = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId }
  });

  if (!product) throw new Error("NOT_FOUND");

  return await prisma.recipe.findMany({
    where: { productId: cleanId },
    include: { inventoryItem: true }
  });
};

const checkAvailability = async (id) => {
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
  checkAvailability
};