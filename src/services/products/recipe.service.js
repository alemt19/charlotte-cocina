import { prisma } from '../../db/client.js';

const createRecipe = async (data) => {
  const { productId, inventoryItemId, quantityRequired, applyOn, isMandatory } = data;

  if (Number(quantityRequired) <= 0) {
    throw new Error("QUANTITY_MUST_BE_POSITIVE");
  }

  const validScopes = ['ALL', 'DINE_IN', 'TAKEOUT', 'DELIVERY', 'PICKUP'];
  const scope = applyOn || 'ALL';
  if (!validScopes.includes(scope)) {
    throw new Error("INVALID_SCOPE");
  }

  return await prisma.recipe.create({
    data: {
      productId,
      inventoryItemId,
      quantityRequired: Number(quantityRequired),
      applyOn: scope,
      isMandatory: isMandatory !== undefined ? isMandatory : true
    }
  });
};

const updateRecipe = async (id, data) => {
  return await prisma.recipe.update({
    where: { id },
    data: {
      ...data,
      quantityRequired: data.quantityRequired ? Number(data.quantityRequired) : undefined
    },
  updateRecipe,
  });
};

const deleteRecipe = async (id) => {
  return await prisma.recipe.delete({
    where: { id }
  });
};

export default {
  createRecipe,
  deleteRecipe,
  updateRecipe
};