import express from 'express';
import { listItems, createItem, getItem, updateItem, registerInbound, registerOutbound, getItemLogs } from '../../controllers/kitchen/inventory.controller.js';

const router = express.Router();

router.get('/items', listItems);
router.post('/items', createItem);
router.get('/items/:id', getItem);
router.get('/items/:id/logs', getItemLogs);
router.patch('/items/:id', updateItem);
router.post('/inbound', registerInbound);
router.post('/outbound', registerOutbound);

export default router;
