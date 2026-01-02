import { prisma } from '../../db/client.js';

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

// --- MODIFICADO PARA MANEJAR IMÁGENES ---
const createProduct = async (data) => {
  let finalImageUrl = null;

  // Si recibimos un archivo desde el controlador
  if (data.imageFile) {
    // Detectamos si estamos en local o prod
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    // Construimos la URL: http://localhost:3000/public/uploads/nombre-archivo.jpg
    finalImageUrl = `${appUrl}/public/uploads/${data.imageFile.filename}`;
  } else if (data.imageUrl || data.image_url) {
    // Si mandaron una URL directa (string)
    finalImageUrl = data.imageUrl || data.image_url;
  }

  // Preparamos los datos para Prisma
  // Convertimos inputs a los nombres de la DB
  const prismaData = {
    name: data.name,
    description: data.description,
    basePrice: parseFloat(data.basePrice || data.base_price), // Soporta ambos
    categoryId: data.categoryId || data.category_id,
    imageUrl: finalImageUrl // <--- Guardamos la URL generada
  };

  return await prisma.kitchenProduct.create({ data: prismaData });
};

const updateProduct = async (id, data) => {
  const cleanId = id.trim();

  const exists = await prisma.kitchenProduct.findUnique({ where: { id: cleanId } });
  if (!exists) throw new Error("NOT_FOUND");

  const updateData = { ...data };

  if (updateData.imageFile) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    updateData.imageUrl = `${appUrl}/public/uploads/${updateData.imageFile.filename}`;
    delete updateData.imageFile;
  }

  return await prisma.kitchenProduct.update({
    where: { id: cleanId },
    data: updateData
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

// --- ENDPOINT 10: Ver Receta del Producto (CORREGIDO A CAMELCASE) ---
const getProductRecipe = async (productId) => {
  const cleanId = productId.trim();
  
  const recipes = await prisma.recipe.findMany({
    where: { productId: cleanId },
    include: {
      inventoryItem: true 
    }
  });

  // CORRECCIÓN: Devuelve camelCase
  return recipes.map(item => ({
    ingredientName: item.inventoryItem?.name || "Ingrediente desconocido",
    qty: item.quantityRequired,
    unit: item.inventoryItem?.unitMeasure || "UNIDAD", // Corregido: en Prisma es 'unitMeasure'
    scope: item.applyOn || "TODO"
  }));
};

// --- ENDPOINT 11: Verificar Disponibilidad (CORREGIDO A CAMELCASE) ---
const checkProductAvailability = async (productId) => {
  const cleanId = productId.trim();

  // 1. Verificar "Kill Switch"
  const product = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId },
    include: { recipes: { include: { inventoryItem: true } } }
  });

  if (!product) throw new Error("NOT_FOUND");

  // Si isActive es false, está NO DISPONIBLE
  if (!product.isActive) {
    return {
      productId: product.id,      // camelCase
      status: "UNAVAILABLE",
      reason: "Producto desactivado manualmente (Kill Switch)",
      missingItems: []            // camelCase
    };
  }

  // 2. Verificar Stock
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

  // 3. Resultado final
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