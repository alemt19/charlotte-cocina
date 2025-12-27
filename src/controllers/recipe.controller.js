// src/controllers/recipe.controller.js
import recipeService from '../services/recipe.service.js';

const createRecipe = async (req, res, next) => {
  try {
    const data = req.body;
    
    // Llamamos al servicio
    const newRecipe = await recipeService.createRecipe(data);

    res.status(201).json({
      success: true,
      message: "Receta creada exitosamente",
      data: newRecipe
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createRecipe,
};