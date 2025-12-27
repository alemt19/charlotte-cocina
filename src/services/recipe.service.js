import { prisma } from '../db/client.js';

const createRecipe = async (data) => {
  const { product_id, inventory_item_id, quantity_required, apply_on } = data;

  // 1. Validar que la cantidad sea mayor a 0
  if (parseFloat(quantity_required) <= 0) {
    throw new Error("QUANTITY_MUST_BE_POSITIVE");
  }

  // 2. Validar que apply_on sea válido (Opcional, Prisma lo hace, pero esto es más seguro)
  const validScopes = ['ALL', 'DINE_IN', 'TAKE_AWAY', 'DELIVERY']; // Ajusta según tu ENUM en Prisma
  if (!validScopes.includes(apply_on)) {
    throw new Error("INVALID_SCOPE");
  }

  // 3. Crear la receta en la base de datos
  // Nota: Mapeamos los nombres snake_case del body a camelCase de Prisma
  return await prisma.recipe.create({
    data: {
      productId: product_id,
      inventoryItemId: inventory_item_id,
      quantityRequired: parseFloat(quantity_required),
      applyOn: apply_on
    }
  });
};

export default {
  createRecipe,
};