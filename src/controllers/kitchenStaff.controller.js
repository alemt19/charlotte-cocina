import {
    getAllKitchenStaff,
    getKitchenStaffById,
    createKitchenStaff,
    updateKitchenStaff,
    deleteKitchenStaff,
} from '../services/kitchenStaff.service.js';

const getAll = async (req, res) => {
    const staff = await getAllKitchenStaff();
    res.json(staff);
};

const getById = async (req, res) => {
    const staff = await getKitchenStaffById(req.params.id);

    if (!staff) {
        return res.status(404).json({ message: 'Personal no encontrado' });
    }

    res.json(staff);
};

const create = async (req, res) => {
    try {
        const staff = await createKitchenStaff(req.body);
        res.status(201).json(staff);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear personal' });
    }
};

const update = async (req, res) => {
    const staff = await updateKitchenStaff(req.params.id, req.body);
    res.json(staff);
};

const remove = async (req, res) => {
    await deleteKitchenStaff(req.params.id);
    res.status(204).send();
};

export {
    getAll,
    getById,
    create,
    update,
    remove,
};
