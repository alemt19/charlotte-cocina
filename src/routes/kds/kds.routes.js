import express from 'express';
import {
    getQueueTasksController,
    assignTaskController,
    updateTaskStatusController,
    markTaskServedController,
    rejectTaskController,
    cancelExternalOrderController,
    getTaskHistoryController,
    injectOrderController,
} from '../../controllers/kds/kds.controller.js';

const router = express.Router();

// Endpoint 1: Inyectar nuevo pedido
router.post('/kds/inject', injectOrderController);

// Endpoint 2: Mostrar tareas pendientes
router.get('/kds/queue', getQueueTasksController);

// Endpoint 3: Asignar chef/mesero
router.patch('/kds/:id/assign', assignTaskController);

// Endpoint 4: Actualizar estado de tarea
router.patch('/kds/:id/status', updateTaskStatusController);

// Endpoint 5: Marcar tarea como servida
router.patch('/kds/:id/served', markTaskServedController);

// Endpoint 6: Anular tarea KDS
router.post('/kds/:id/reject', rejectTaskController);

// Endpoint 7: Cancelar orden externa completa
router.post('/kds/order/:external_id/cancel', cancelExternalOrderController);

// Endpoint 8: Historial de tareas
router.get('/kds/history', getTaskHistoryController);

export default router;