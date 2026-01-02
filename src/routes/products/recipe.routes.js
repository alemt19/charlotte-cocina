import { Router } from 'express';
import recipeController from '../../controllers/products/recipe.controller.js';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';

const router = Router();

// Crear Receta (Create)
router.post('/', 
  requirePermission('Recipe_cocina', 'Create'), 
  recipeController.createRecipe
);

export default router;