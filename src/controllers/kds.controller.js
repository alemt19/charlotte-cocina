import { injectOrderSchema } from '../schemas/kds.schema.js';
import { injectOrder } from '../services/kds.service.js';

const injectOrderController = async (req, res) => {
    try {
        const parsed = injectOrderSchema.parse(req.body);
        const result = await injectOrder(parsed);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error en injectOrderController:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};