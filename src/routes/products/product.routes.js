import { Router } from 'express';
import productController from '../../controllers/products/product.controller.js';

const router = Router();



router.get('/', productController.getProducts);          
router.post('/', productController.createProduct);       


router.get('/:id', productController.getProductById);   
router.put('/:id', productController.updateProduct);     
router.delete('/:id', productController.deleteProduct);  

router.patch('/:id/status', productController.toggleProductStatus); 
// Endpoint 10: Ver la receta de un producto
router.get('/:id/recipe', productController.getProductRecipe);

// Endpoint 11: Verificar si hay stock disponible para venderlo
router.get('/:id/availability', productController.checkAvailability);
export default router;