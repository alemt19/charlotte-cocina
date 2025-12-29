import express from 'express';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';
import { createAsset, listAssets, getAsset, updateAsset, getAssetLogs } from '../../controllers/inventory/asset.controller.js';
import { registerAssetLog } from '../../controllers/inventory/asset.controller.js';

const router = express.Router();

router.get('/', requirePermission('KitchenAsset_cocina', 'Read'), listAssets);
router.post('/', requirePermission('KitchenAsset_cocina', 'Create'), createAsset);
router.get('/:id', requirePermission('KitchenAsset_cocina', 'Read'), getAsset);
router.patch('/:id', requirePermission('KitchenAsset_cocina', 'Update'), updateAsset);
router.post('/:id/logs', requirePermission('AssetLog_cocina', 'Create'), registerAssetLog);
router.get('/:id/logs', requirePermission('AssetLog_cocina', 'Read'), getAssetLogs);

export default router;
