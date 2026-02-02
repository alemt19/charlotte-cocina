import { Router } from 'express';
import * as exampleController from '../../controllers/example/example.controller.js';
import { requestLogger } from '../../middlewares/example/example.middleware.js';

const router = Router();

// Aplicar middleware a todas las rutas de este router
router.use(requestLogger);

router.get('/', exampleController.getUsers);
router.post('/', exampleController.createUser);

// Ejemplos: rutas protegidas delegando la validación al Módulo de Seguridad
router.get('/protected/ping', exampleController.securePing);
router.post('/protected/ping', exampleController.securePing);

export default router;
