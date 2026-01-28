import { Router } from 'express';
import recipeController from '../../controllers/products/recipe.controller.js';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';
import { validateSchema } from '../../middlewares/validateSchema.js';
import { createRecipeSchema, updateRecipeSchema } from '../../schemas/products/recipe.schema.js';

const router = Router();

// Crear Receta (Create)
router.post('/', 
  requirePermission('Recipe_cocina', 'Create'), 
  validateSchema(createRecipeSchema),
  recipeController.createRecipe
);

// Actualizar Receta (Update)
router.patch('/:id',
  requirePermission('Recipe_cocina', 'Update'),
  validateSchema(updateRecipeSchema),
  recipeController.updateRecipe
);

// Eliminar receta (Delete)
router.delete('/:id',
  requirePermission('Recipe_cocina', 'Delete'),
  recipeController.deleteRecipe
);

export default router;