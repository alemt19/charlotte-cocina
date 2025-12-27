import {
    getAllKitchenStaff,
    getKitchenStaffById,
    createKitchenStaff,
    updateKitchenStaff,
    deleteKitchenStaff,
    getActiveKitchenStaff,
} from '../../services/kds/kitchenStaff.service.js';

import { createKitchenStaffSchema, updateKitchenStaffSchema, idSchema } from '../../schemas/kitchenStaff.schema.js';

const getAll = async (req, res, next) => {
    try {
        const staff = await getAllKitchenStaff();
        res.json(staff);
    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {
        const validation = idSchema.safeParse(req.params);
            if (!validation.success) {
                return res.status(400).json({ errors: validation.error.format() });
    }

    const staff = await getKitchenStaffById(validation.data.id);
        if (!staff) {
            return res.status(404).json({ message: 'Personal no encontrado' });
    }
    res.json(staff);
    } catch (error) {
    next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const idValidation = idSchema.safeParse(req.params);
            if (!idValidation.success) {
                return res.status(400).json({ errors: idValidation.error.format() });
    }

    const bodyValidation = updateKitchenStaffSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            return res.status(400).json({ errors: bodyValidation.error.format() });
    }

    const staff = await updateKitchenStaff(idValidation.data.id, bodyValidation.data);
    res.json(staff);
    } catch (error) {
    next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const validation = idSchema.safeParse(req.params);
            if (!validation.success) {
                return res.status(400).json({ errors: validation.error.format() });
    }

    await deleteKitchenStaff(validation.data.id);
    res.status(204).send();
    } catch (error) {
    next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const validation = createKitchenStaffSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ errors: validation.error.format() });
    }

    const staff = await createKitchenStaff(validation.data);
    res.status(201).json(staff);
    } catch (error) {
    next(error);
    }
};

const getActiveKitchenStaffController = async (req, res) => {
    try {
        const staff = await getActiveKitchenStaff();
        res.status(200).json(staff);
    } catch (error) {
        console.error('Error en getActiveKitchenStaffController:', error);
        res.status(400).json({ message: error.message });
    }
};

export { getAll, getById, create, update, remove, getActiveKitchenStaffController };
