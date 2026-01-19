import { prisma } from '../../db/client.js';

const createRecipe = async (data) => {
  return await prisma.recipe.create({
    data: {
      productId: data.product_id,
      inventoryItemId: data.inventory_item_id,
      quantityRequired: data.quantity_required,
      scope: data.apply_on 
    }
  });
};

export default {
  createRecipe
};