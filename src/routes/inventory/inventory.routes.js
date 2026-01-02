import express from 'express';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';
import { listItems, createItem, getItem, updateItem, registerInbound, registerOutbound, getItemLogs } from '../../controllers/inventory/inventory.controller.js';

const router = express.Router();

router.get('/items', requirePermission('InventoryItem_cocina', 'Read'), listItems);
router.post('/items', requirePermission('InventoryItem_cocina', 'Create'), createItem);
router.get('/items/:id', requirePermission('InventoryItem_cocina', 'Read'), getItem);
router.get('/items/:id/logs', requirePermission('InventoryLog_cocina', 'Read'), getItemLogs);
router.patch('/items/:id', requirePermission('InventoryItem_cocina', 'Update'), updateItem);
router.post('/inbound', requirePermission('InventoryLog_cocina', 'Create'), registerInbound);
router.post('/outbound', requirePermission('InventoryLog_cocina', 'Create'), registerOutbound);

export default router;
