// src/routes/category.routes.js
import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller.js';

const router = Router();

// Ya no inyectamos middlewares aquí, la lógica pasó al controlador
router.get('/', getCategories);
router.post('/', createCategory);

export default router;