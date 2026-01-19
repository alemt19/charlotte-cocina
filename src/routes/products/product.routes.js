import { Router } from 'express';
import productController from '../../controllers/products/product.controller.js';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = Router();

router.get('/', productController.getProducts);

router.get('/:id', productController.getProductById);

router.post('/', upload.single('image'), productController.createProduct);

router.patch('/:id', productController.updateProduct);

router.delete('/:id', productController.deleteProduct);

router.patch('/:id/status', productController.toggleProductStatus);

router.get('/:id/recipe', requirePermission('KitchenProduct_cocina', 'Read'), productController.getProductRecipe);

router.get('/:id/availability', requirePermission('KitchenProduct_cocina', 'Read'), productController.checkAvailability);

export default router;