import express from 'express';
import { injectOrderController } from '../controllers/kds.controller.js';
import { getActiveKitchenStaffController } from '../controllers/kitchenStaff.controller.js';

const router = express.Router();

// Endpoint 1: Inyectar nuevo pedido
router.post('/api/kitchen/kds/inject', injectOrderController);

// Endpoint 9: Listar personal activo
router.get('/api/kitchen/staff', getActiveKitchenStaffController);

export default router;