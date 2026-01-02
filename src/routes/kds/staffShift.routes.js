import express from 'express';
import {
    registerShiftController,
    getShiftHistoryController,
} from '../../controllers/kds/staffShift.controller.js';

const router = express.Router();

// Endpoint 10: Registrar entrada/salida de turno
router.post('/staff/:staffId/shift', registerShiftController);

// Endpoint 12: Obtener historial de turnos
router.get('/staff/:id/shifts', getShiftHistoryController);

export default router;