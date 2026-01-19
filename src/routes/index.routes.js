import { Router } from 'express';
import kitchenStaffRoutes from './kds/kitchenStaff.routes.js';
import staffShiftRoutes from './kds/staffShift.routes.js';
import kdsRoutes from './kds/kds.routes.js';
import inventoryRoutes from './inventory/inventory.routes.js';
import assetsRoutes from './inventory/assets.routes.js';
import categoryRoutes from './products/category.routes.js';
import productRoutes from './products/product.routes.js';
import recipeRoutes from './products/recipe.routes.js';

const router = Router();

router.use('/', kitchenStaffRoutes);
router.use('/', staffShiftRoutes);
router.use('/', kdsRoutes);

router.use('/inventory', inventoryRoutes);
router.use('/assets', assetsRoutes);

router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/recipes', recipeRoutes);

export default router;