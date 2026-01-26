import { Router } from 'express';
import { getAll, getById, create, update, remove, getActiveKitchenStaffController, validateWorkerCodeController, regeneratePin } from '../../controllers/kds/kitchenStaff.controller.js';

const router = Router();

router.post('/staff/validate', validateWorkerCodeController);
router.get('/staff', getAll);
router.get('/staff/active', getActiveKitchenStaffController);
router.get('/staff/:id', getById);
router.post('/staff', create);
router.patch('/staff/:id', update);
router.patch('/staff/:id/regenerate-pin', regeneratePin);
router.delete('/staff/:id', remove);

export default router;
