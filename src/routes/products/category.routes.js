import { Router } from 'express';
// IMPORTANTE: Aquí importamos el controlador y le asignamos el nombre "categoryController"
import categoryController from '../../controllers/products/category.controller.js';

const router = Router();

// 1. Obtener categorías (GET)
// Nota: Verifica si en tu controlador la función se llama "getCategories" o "findCategories"
// Si te da error aquí, cambia .findCategories por .getCategories
router.get('/', categoryController.findCategories || categoryController.getCategories);

// 2. Crear categoría (POST)
router.post('/', categoryController.createCategory);

// 3. Actualizar categoría (PATCH)
router.patch('/:id', categoryController.updateCategory);

// 4. Eliminar categoría (DELETE)
router.delete('/:id', categoryController.deleteCategory);

export default router;