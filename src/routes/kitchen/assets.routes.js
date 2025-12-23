import express from 'express';
import { createAsset, listAssets, getAsset, updateAsset } from '../../controllers/kitchen/asset.controller.js';

const router = express.Router();

router.get('/', listAssets);
router.post('/', createAsset);
router.get('/:id', getAsset);
router.patch('/:id', updateAsset);

export default router;
