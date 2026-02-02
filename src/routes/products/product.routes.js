import { Router } from 'express';
import productController from '../../controllers/products/product.controller.js';
import { upload } from '../../middlewares/upload.middleware.js'; // <--- Importamos multer

const router = Router();

// Listar productos (Read)
router.get('/', 
  productController.getProducts
);

// Crear producto (Create) - AQUI AGREGAMOS EL UPLOAD
router.post('/', 
  upload.single('image'), // <--- Intercepta la imagen llamada 'image'
  productController.createProduct
);

// Obtener por ID (Read)
router.get('/:id', 
  productController.getProductById
);

// Actualizar producto (Update)
router.patch('/:id', 
  upload.single('image'),
  productController.updateProduct
);

// Eliminar producto (Delete)
router.delete('/:id', 
  productController.deleteProduct
);

// Toggle Status (Update)
router.patch('/:id/status', 
  productController.toggleProductStatus
);

// --- ENDPOINTS NUEVOS ---

// Endpoint 10: Ver Receta
router.get('/:id/recipe',
  productController.getProductRecipe
);

// Endpoint 11: Disponibilidad
router.get('/:id/availability', 
  productController.checkAvailability
);

export default router;
