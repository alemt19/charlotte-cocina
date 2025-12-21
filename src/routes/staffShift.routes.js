import express from 'express';
import {
    registerShiftController,
    getShiftHistoryController,
} from '../controllers/staffShift.controller.js';

const router = express.Router();

// Endpoint 10: Registrar entrada/salida de turno
router.post('/api/kitchen/staff/:staff_id/shift', registerShiftController);

// Endpoint 12: Obtener historial de turnos
router.get('/api/kitchen/staff/:id/shifts', getShiftHistoryController);

export default router;