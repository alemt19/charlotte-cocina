import { Router } from 'express';
// Mantenemos tu importación correcta
import categoryController from '../../controllers/products/category.controller.js';

const router = Router();

// 1. Obtener categorías (Read)
router.get('/', 
  categoryController.getCategories
);

// 2. Crear categoría (Create)
router.post('/', 
  categoryController.createCategory
);

// 3. Actualizar categoría (Update)
router.patch('/:id', 
  categoryController.updateCategory
);

// 4. Eliminar categoría (Delete)
router.delete('/:id', 
  categoryController.deleteCategory
);

export default router;