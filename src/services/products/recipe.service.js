import { prisma } from '../../db/client.js';

const createRecipe = async (data) => {
  const { product_id, inventory_item_id, quantity_required, apply_on } = data;

  if (parseFloat(quantity_required) <= 0) {
    throw new Error("QUANTITY_MUST_BE_POSITIVE");
  }

  const validScopes = ['ALL', 'DINE_IN', 'TAKE_AWAY', 'DELIVERY']; 
  if (!validScopes.includes(apply_on)) {
    throw new Error("INVALID_SCOPE");
  }

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