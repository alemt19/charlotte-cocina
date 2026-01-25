
import recipeService from '../../services/products/recipe.service.js';

const createRecipe = async (req, res, next) => {
  try {
    const data = req.body;
    
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

const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    await recipeService.deleteRecipe(id);
    res.status(200).json({ success: true, message: "Ingrediente eliminado de la receta" });
  } catch (error) {
    next(error);
  }
};

export default {
  createRecipe,
  deleteRecipe
};