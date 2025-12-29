import { Router } from 'express';
import productController from '../../controllers/products/product.controller.js';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js'; // <--- Importamos multer

const router = Router();

// Listar productos (Read)
router.get('/', 
  requirePermission('KitchenProduct_cocina', 'Read'), 
  productController.getProducts
);

// Crear producto (Create) - AQUI AGREGAMOS EL UPLOAD
router.post('/', 
  requirePermission('KitchenProduct_cocina', 'Create'), 
  upload.single('image'), // <--- Intercepta la imagen llamada 'image'
  productController.createProduct
);

// Obtener por ID (Read)
router.get('/:id', 
  requirePermission('KitchenProduct_cocina', 'Read'), 
  productController.getProductById
);

// Actualizar producto (Update)
router.patch('/:id', 
  requirePermission('KitchenProduct_cocina', 'Update'), 
  productController.updateProduct
);

// Eliminar producto (Delete)
router.delete('/:id', 
  requirePermission('KitchenProduct_cocina', 'Delete'), 
  productController.deleteProduct
);

// Toggle Status (Update)
router.patch('/:id/status', 
  requirePermission('KitchenProduct_cocina', 'Update'), 
  productController.toggleProductStatus
);

// --- ENDPOINTS NUEVOS ---

// Endpoint 10: Ver Receta
router.get('/:id/recipe', 
  requirePermission('Recipe_cocina', 'Read'), 
  productController.getProductRecipe
);

// Endpoint 11: Disponibilidad
router.get('/:id/availability', 
  requirePermission('KitchenProduct_cocina', 'Read'), 
  productController.checkAvailability
);

export default router;