import * as inventoryService from '../../services/kitchen/inventory.service.js';

const ALLOWED_TYPES = ['INGREDIENT', 'PACKAGING'];
const ALLOWED_UNITS = ['KG', 'G', 'L', 'ML', 'UNIT'];

export const listItems = async (req, res) => {
  const { type, stock_status } = req.query;
  try {
    const items = await inventoryService.findItems({ type, stock_status });
    return res.json(items);
  } catch (err) {
    console.error('Error listItems:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createItem = async (req, res) => {
  const { name, type, unit_measure, min_stock_alert } = req.body;

  if (!name || !type || !unit_measure || min_stock_alert === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: `type inválido. Valores permitidos: ${ALLOWED_TYPES.join(', ')}` });
  }

  if (!ALLOWED_UNITS.includes(unit_measure)) {
    return res.status(400).json({ error: `unit_measure inválido. Valores permitidos: ${ALLOWED_UNITS.join(', ')}` });
  }

  const minStock = Math.round(Number(min_stock_alert) || 0);

  try {
    const created = await inventoryService.createItem({
      name,
      type,
      unit: unit_measure,
      minStockAlert: minStock
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error('Error createItem:', err);
    return res.status(500).json({ error: 'Error interno al crear ítem', details: err?.message });
  }
};
