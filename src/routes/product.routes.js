import { Router } from 'express';
import productController from '../controllers/product.controller.js';

const router = Router();

// Base: /api/kitchen/products

router.get('/', productController.getProducts);          // Listar
router.post('/', productController.createProduct);       // Crear

// Rutas dinámicas por ID
router.get('/:id', productController.getProductById);    // Endpoint 7 (GET One)
router.put('/:id', productController.updateProduct);     // Endpoint 8 (PUT Update)
router.delete('/:id', productController.deleteProduct);  // Eliminar

// Rutas especiales
router.patch('/:id/status', productController.toggleProductStatus); // Toggle

export default router;