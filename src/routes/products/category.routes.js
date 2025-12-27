import { Router } from 'express';
// Mantenemos tu importación correcta
import categoryController from '../../controllers/products/category.controller.js';
// Importamos el middleware (subimos 2 niveles para salir de routes/products)
import { requirePermission } from '../../middlewares/security/permission.middleware.js';

const router = Router();

// 1. Obtener categorías (Read)
router.get('/', 
  requirePermission('KitchenCategory_cocina', 'Read'), 
  categoryController.getCategories
);

// 2. Crear categoría (Create)
router.post('/', 
  requirePermission('KitchenCategory_cocina', 'Create'), 
  categoryController.createCategory
);

// 3. Actualizar categoría (Update)
router.patch('/:id', 
  requirePermission('KitchenCategory_cocina', 'Update'), 
  categoryController.updateCategory
);

// 4. Eliminar categoría (Delete)
router.delete('/:id', 
  requirePermission('KitchenCategory_cocina', 'Delete'), 
  categoryController.deleteCategory
);

export default router;