import { Router } from 'express';
import categoryController from '../../controllers/products/category.controller.js';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';

const router = Router();

router.get('/', categoryController.getCategories);

router.post('/', 
  requirePermission('KitchenCategory_cocina', 'Create'), 
  categoryController.createCategory
);

router.patch('/:id', 
  requirePermission('KitchenCategory_cocina', 'Update'), 
  categoryController.updateCategory
);

router.delete('/:id', 
  requirePermission('KitchenCategory_cocina', 'Delete'), 
  categoryController.deleteCategory
);

export default router;