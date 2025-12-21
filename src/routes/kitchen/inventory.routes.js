import express from 'express';
import { listItems, createItem, getItem, updateItem } from '../../controllers/kitchen/inventory.controller.js';

const router = express.Router();

router.get('/items', listItems);
router.post('/items', createItem);
router.get('/items/:id', getItem);
router.patch('/items/:id', updateItem);

export default router;
