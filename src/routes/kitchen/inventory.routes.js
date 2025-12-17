import express from 'express';
import { listItems, createItem } from '../../controllers/kitchen/inventory.controller.js';

const router = express.Router();

router.get('/items', listItems);
router.post('/items', createItem);

export default router;
