import { registerShift, getShiftHistory } from '../../services/kds/staffShift.service.js';

const registerShiftController = async (req, res, next) => {
    try {
        const { staff_id } = req.params;
        const { type } = req.body;

    if (!['CHECK_IN', 'CHECK_OUT'].includes(type)) {
        return res.status(400).json({ message: 'Tipo inválido, use CHECK_IN o CHECK_OUT' });
    }

        const shift = await registerShift(staff_id, type);
        res.status(201).json(shift);
    } catch (error) {
        console.error('Error en registerShiftController:', error);
        res.status(400).json({ message: error.message });
    }
};

const getShiftHistoryController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { start_date, end_date } = req.query;

        const shifts = await getShiftHistory(id, start_date, end_date);
        res.status(200).json(shifts);
    } catch (error) {
        console.error('Error en getShiftHistoryController:', error);
        res.status(400).json({ message: error.message });
    }
};

export { registerShiftController, getShiftHistoryController };