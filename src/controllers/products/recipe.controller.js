import recipeService from '../../services/products/recipe.service.js';
import { createRecipeSchema } from '../../schemas/products/recipe.schema.js';

const createRecipe = async (req, res, next) => {
  try {
    const validation = createRecipeSchema.safeParse(req);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: validation.error.errors[0].message
      });
    }

    const newRecipe = await recipeService.createRecipe(validation.data.body);

    res.status(201).json({
      success: true,
      message: "Receta creada exitosamente",
      data: newRecipe
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: "Este ingrediente ya existe en este producto." });
    }
    next(error);
  }
};

export default {
  createRecipe
};