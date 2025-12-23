import express from 'express';
import {
    getQueueTasksController,
    assignTaskController,
    updateTaskStatusController,
    markTaskServedController,
    rejectTaskController,
    cancelExternalOrderController,
    getTaskHistoryController,
} from '../controllers/kds.controller.js';

const router = express.Router();

// Endpoint 2: Mostrar tareas pendientes
router.get('/api/kitchen/kds/queue', getQueueTasksController);

// Endpoint 3: Asignar chef/mesero
router.patch('/api/kitchen/kds/:id/assign', assignTaskController);

// Endpoint 4: Actualizar estado de tarea
router.patch('/api/kitchen/kds/:id/status', updateTaskStatusController);

// Endpoint 5: Marcar tarea como servida
router.patch('/api/kitchen/kds/:id/served', markTaskServedController);

// Endpoint 6: Anular tarea KDS
router.post('/api/kitchen/kds/:id/reject', rejectTaskController);

// Endpoint 7: Cancelar orden externa completa
router.post('/api/kitchen/kds/order/:external_id/cancel', cancelExternalOrderController);

// Endpoint 8: Historial de tareas
router.get('/api/kitchen/kds/history', getTaskHistoryController);

export default router;