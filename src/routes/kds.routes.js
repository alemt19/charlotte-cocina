import express from 'express';
import { getQueueTasksController, assignTaskController, updateTaskStatusController } from '../controllers/kds.controller.js';

const router = express.Router();

// Endpoint 2: Mostrar tareas pendientes
router.get('/api/kitchen/kds/queue', getQueueTasksController);

// Endpoint 3: Asignar chef/mesero
router.patch('/api/kitchen/kds/:id/assign', assignTaskController);

// Endpoint 4: Actualizar estado de tarea
router.patch('/api/kitchen/kds/:id/status', updateTaskStatusController);

export default router;