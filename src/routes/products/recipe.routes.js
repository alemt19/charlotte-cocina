import { Router } from 'express';
import recipeController from '../../controllers/products/recipe.controller.js';
import { validateSchema } from '../../middlewares/validateSchema.js';
import { createRecipeSchema, updateRecipeSchema } from '../../schemas/products/recipe.schema.js';

const router = Router();

// Crear Receta (Create)
router.post('/', 
  validateSchema(createRecipeSchema),
  recipeController.createRecipe
);

// Actualizar Receta (Update)
router.patch('/:id',
  validateSchema(updateRecipeSchema),
  recipeController.updateRecipe
);

// Eliminar receta (Delete)
router.delete('/:id',
  recipeController.deleteRecipe
);

export default router;