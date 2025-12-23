import { injectOrderSchema } from '../schemas/kds.schema.js';
import {
    injectOrder,
    getQueueTasks,
    assignTask,
    updateTaskStatus,
    markTaskServed,
    rejectTask,
    cancelExternalOrder,
    getTaskHistory,
} from '../services/kds.service.js';

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

export const markTaskServedController = async (req, res) => {
    try {
        const { id } = req.params;
        const { staff_id } = req.body;
        const task = await markTaskServed(id, staff_id);
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const rejectTaskController = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, reported_by } = req.body;
        const task = await rejectTask(id, reason, reported_by);
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const cancelExternalOrderController = async (req, res) => {
    try {
        const { external_id } = req.params;
        const tasks = await cancelExternalOrder(external_id);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getTaskHistoryController = async (req, res) => {
    try {
        const tasks = await getTaskHistory(req.query);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { getQueueTasksController, assignTaskController, updateTaskStatusController, injectOrderController };