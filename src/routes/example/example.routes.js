import { Router } from 'express';
import * as exampleController from '../../controllers/example/example.controller.js';
import { requestLogger } from '../../middlewares/example/example.middleware.js';
import { requirePermission } from '../../middlewares/security/permission.middleware.js';

const router = Router();

// Aplicar middleware a todas las rutas de este router
router.use(requestLogger);

router.get('/', exampleController.getUsers);
router.post('/', exampleController.createUser);

// Ejemplos: rutas protegidas delegando la validación al Módulo de Seguridad
router.get('/protected/ping', requirePermission('KitchenStaff_cocina', 'Read'), exampleController.securePing);
router.post('/protected/ping', requirePermission('Recipe_cocina', 'Create'), exampleController.securePing);

export default router;
