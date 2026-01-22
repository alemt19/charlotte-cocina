import { Router } from 'express';
import productController from '../../controllers/products/product.controller.js';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = Router();

router.get('/', 
  productController.getProducts
);

router.get('/:id', 
  productController.getProductById
);

router.post('/', 
  requirePermission('KitchenProduct_cocina', 'Create'),
  upload.single('image'), 
  productController.createProduct
);

router.patch('/:id', 
  requirePermission('KitchenProduct_cocina', 'Update'), 
  upload.single('image'),
  productController.updateProduct
);

router.delete('/:id', 
  requirePermission('KitchenProduct_cocina', 'Delete'),
  productController.deleteProduct
);

router.patch('/:id/status', 
  requirePermission('KitchenProduct_cocina', 'Update'),
  productController.toggleProductStatus
);

router.get('/:id/recipe', 
  requirePermission('KitchenProduct_cocina', 'Read'), 
  productController.getProductRecipe
);

router.get('/:id/availability', 
  requirePermission('KitchenProduct_cocina', 'Read'), 
  productController.checkAvailability
);

export default router;