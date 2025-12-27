
import { Router } from 'express';
import recipeController from '../../controllers/products/recipe.controller.js';

const router = Router();

router.post('/', recipeController.createRecipe);

export default router;