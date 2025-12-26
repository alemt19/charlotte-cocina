import express from 'express';
import { createAsset, listAssets, getAsset, updateAsset, getAssetLogs } from '../../controllers/kitchen/asset.controller.js';
import { registerAssetLog } from '../../controllers/kitchen/asset.controller.js';

const router = express.Router();

router.get('/', listAssets);
router.post('/', createAsset);
router.get('/:id', getAsset);
router.patch('/:id', updateAsset);
router.post('/:id/logs', registerAssetLog);
router.get('/:id/logs', getAssetLogs);

export default router;
