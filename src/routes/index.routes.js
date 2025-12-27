import { Router } from 'express';
import kitchenStaffRoutes from './kds/kitchenStaff.routes.js';
import staffShiftRoutes from './kds/staffShift.routes.js';
import kdsRoutes from './kds/kds.routes.js';
import inventoryRoutes from './inventory/inventory.routes.js';
import assetsRoutes from './inventory/assets.routes.js';

const router = Router();

router.use('/', kitchenStaffRoutes);
router.use('/', staffShiftRoutes);
router.use('/', kdsRoutes);

router.use('/inventory', inventoryRoutes);
router.use('/assets', assetsRoutes);

export default router;