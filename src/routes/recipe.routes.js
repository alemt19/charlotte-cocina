// src/routes/recipe.routes.js
import { Router } from 'express';
import recipeController from '../controllers/recipe.controller.js';

const router = Router();

// Definimos el POST en la raíz (que será /api/kitchen/recipes)
router.post('/', recipeController.createRecipe);

export default router;