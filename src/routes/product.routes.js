import { Router } from 'express';
import productController from '../controllers/product.controller.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { 
  createProductSchema, 
  getProductsQuerySchema
  // toggleProductStatusSchema 
} from '../schemas/product.schema.js';

const router = Router();

// 1. Obtener productos
router.get('/', validateSchema(getProductsQuerySchema), productController.getProducts);

// 2. Crear producto
router.post('/', validateSchema(createProductSchema), productController.createProduct);

// --- RUTAS ESPECÍFICAS (Deben ir antes de /:id) ---

// 5. Endpoint 6: Cambiar estado (PATCH /api/kitchen/products/:id/status)
router.patch(
  '/:id/status', 
  // validateSchema(toggleProductStatusSchema), // Descomentar si tienes el schema listo
  productController.toggleProductStatus
);

// --- RUTAS GENÉRICAS (Al final) ---

// 3. Actualizar producto (PATCH /api/kitchen/products/:id)
router.patch('/:id', productController.updateProduct);

// 4. Eliminar producto (DELETE /api/kitchen/products/:id)
router.delete('/:id', productController.deleteProduct);

export default router;