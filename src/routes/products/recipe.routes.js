import { Router } from 'express';
import recipeController from '../../controllers/products/recipe.controller.js';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';
import { validateSchema } from '../../middlewares/validateSchema.js';
import { createRecipeSchema } from '../../schemas/products/recipe.schema.js';

const router = Router();

// Crear Receta (Create)
router.post('/', 
  requirePermission('Recipe_cocina', 'Create'), 
  validateSchema(createRecipeSchema),
  recipeController.createRecipe
);

export default router;