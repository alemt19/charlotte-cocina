import express from 'express';
import { createAsset, listAssets, getAsset, updateAsset } from '../../controllers/kitchen/asset.controller.js';
import { registerAssetLog } from '../../controllers/kitchen/asset.controller.js';

const router = express.Router();

router.get('/', listAssets);
router.post('/', createAsset);
router.get('/:id', getAsset);
router.patch('/:id', updateAsset);
router.post('/:id/logs', registerAssetLog);

export default router;
