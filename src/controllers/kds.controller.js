import { injectOrderSchema } from '../schemas/kds.schema.js';
import { injectOrder, getQueueTasks, assignTask, updateTaskStatus } from '../services/kds.service.js';

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

const getQueueTasksController = async (req, res) => {
    try {
        const { status } = req.query;
        const tasks = await getQueueTasks(status);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const assignTaskController = async (req, res) => {
    try {
        const { id } = req.params;
        const { staffId, role } = req.body;
        const task = await assignTask(id, staffId, role);
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateTaskStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus } = req.body;
        const task = await updateTaskStatus(id, newStatus);
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { getQueueTasksController, assignTaskController, updateTaskStatusController, injectOrderController };