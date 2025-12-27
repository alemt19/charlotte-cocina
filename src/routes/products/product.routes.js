import { Router } from 'express';
import productController from '../../controllers/products/product.controller.js';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';

const router = Router();

// Listar productos (Read)
router.get('/', 
  requirePermission('KitchenProduct_cocina', 'Read'), 
  productController.getProducts
);

// Crear producto (Create)
router.post('/', 
  requirePermission('KitchenProduct_cocina', 'Create'), 
  productController.createProduct
);

// Obtener por ID (Read)
router.get('/:id', 
  requirePermission('KitchenProduct_cocina', 'Read'), 
  productController.getProductById
);

// Actualizar producto (Update) - Cambiamos PUT por PATCH que es el estándar para actualizaciones parciales
router.patch('/:id', 
  requirePermission('KitchenProduct_cocina', 'Update'), 
  productController.updateProduct
);

// Eliminar producto (Delete)
router.delete('/:id', 
  requirePermission('KitchenProduct_cocina', 'Delete'), 
  productController.deleteProduct
);

// Toggle Status (Update) - Mantenemos tu ruta '/status'
router.patch('/:id/status', 
  requirePermission('KitchenProduct_cocina', 'Update'), 
  productController.toggleProductStatus
);

// --- TUS ENDPOINTS NUEVOS ---

// Endpoint 10: Ver Receta (Usamos permiso de Recipe porque leemos ingredientes)
router.get('/:id/recipe', 
  requirePermission('Recipe_cocina', 'Read'), 
  productController.getProductRecipe
);

// Endpoint 11: Disponibilidad (Lectura de estado del producto)
router.get('/:id/availability', 
  requirePermission('KitchenProduct_cocina', 'Read'), 
  productController.checkAvailability
);

export default router;