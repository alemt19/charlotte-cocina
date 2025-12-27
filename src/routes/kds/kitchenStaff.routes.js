import { Router } from 'express';
import { getAll, getById, create, update, remove, getActiveKitchenStaffController } from '../../controllers/kds/kitchenStaff.controller.js';

const router = Router();

router.get('/staff', getAll);
router.get('/staff/:id', getById);
router.post('/staff', create);
router.patch('/staff/:id', update);
router.delete('/staff/:id', remove);

// Endpoint 9: Listar personal activo
router.get('/staff/active', getActiveKitchenStaffController);

export default router;
