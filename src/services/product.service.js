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

// --- ENDPOINT 10: Ver Receta del Producto ---
const getProductRecipe = async (productId) => {
  const cleanId = productId.trim();
  
  // Buscamos las recetas de este producto e incluimos los datos del ingrediente (inventoryItem)
  const recipes = await prisma.recipe.findMany({
    where: { productId: cleanId },
    include: {
      inventoryItem: true 
    }
  });

  // Formateamos la respuesta para que se vea bonita como pide el requerimiento
  return recipes.map(item => ({
    ingredient_name: item.inventoryItem?.name || "Ingrediente desconocido",
    qty: item.quantityRequired,
    unit: item.inventoryItem?.measureUnit || "UNIDAD",
    scope: item.applyOn || "TODO"
  }));
};

// --- ENDPOINT 11: Verificar Disponibilidad (Check de Stock) ---
const checkProductAvailability = async (productId) => {
  const cleanId = productId.trim();

  // 1. Verificar "Kill Switch" (Si el producto está desactivado manualmente)
  const product = await prisma.kitchenProduct.findUnique({
    where: { id: cleanId },
    include: { recipes: { include: { inventoryItem: true } } } // Traemos recetas e ingredientes de una vez
  });

  if (!product) throw new Error("NOT_FOUND");

  // Si isActive es false, está NO DISPONIBLE inmediatamente
  if (!product.isActive) {
    return {
      product_id: product.id,
      status: "UNAVAILABLE",
      reason: "Producto desactivado manualmente (Kill Switch)",
      missing_items: []
    };
  }

  // 2. Verificar Stock de cada ingrediente
  const missingItems = [];

  for (const recipe of product.recipes) {
    const required = recipe.quantityRequired;
    // OJO: Asumimos que inventoryItem tiene un campo 'currentStock'. 
    // Si se llama 'quantity' o 'stock', cámbialo aquí.
    const currentStock = recipe.inventoryItem?.currentStock || 0; 

    if (currentStock < required) {
      missingItems.push(
        `${recipe.inventoryItem?.name} (Faltan ${required - currentStock} ${recipe.inventoryItem?.measureUnit})`
      );
    }
  }

  // 3. Resultado final
  if (missingItems.length > 0) {
    return {
      product_id: product.id,
      status: "UNAVAILABLE",
      reason: "Stock insuficiente",
      missing_items: missingItems
    };
  }

  return {
    product_id: product.id,
    status: "AVAILABLE",
    reason: "OK",
    missing_items: []
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