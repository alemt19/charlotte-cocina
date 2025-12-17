import { Router } from 'express';
import {
    getAll,
    getById,
    create,
    update,
    remove,
} from '../controllers/kitchenStaff.controller.js';

const router = Router();

router.get('/staff', getAll);
router.get('/staff/:id', getById);
router.post('/staff', create);
router.patch('/staff/:id', update);
router.delete('/staff/:id', remove);

export default router;
