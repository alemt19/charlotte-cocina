import * as inventoryService from '../../services/kitchen/inventory.service.js';

const ALLOWEDTYPES = ['INGREDIENT', 'PACKAGING'];
const ALLOWEDUNITS = ['KG', 'G', 'L', 'ML', 'UNIT'];

export const listItems = async (req, res) => {
  const { type, stock_status: stockStatus } = req.query;
  try {
    const items = await inventoryService.findItems({ type, stock_status: stockStatus });
    return res.json(items);
  } catch (err) {
    console.error('Error listItems:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createItem = async (req, res) => {
  const { name, type, unit_measure: unitMeasure, min_stock_alert: minStockAlert } = req.body;

  if (!name || !type || !unitMeasure || minStockAlert === undefined) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  if (!ALLOWEDTYPES.includes(type)) {
    return res.status(400).json({ error: `type inválido. Valores permitidos: ${ALLOWEDTYPES.join(', ')}` });
  }

  if (!ALLOWEDUNITS.includes(unitMeasure)) {
    return res.status(400).json({ error: `unitMeasure inválido. Valores permitidos: ${ALLOWEDUNITS.join(', ')}` });
  }

  const minStock = Math.round(Number(minStockAlert) || 0);

  try {
    const created = await inventoryService.createItem({
      name,
      type,
      unit: unitMeasure,
      minStockAlert: minStock
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error('Error createItem:', err);
    return res.status(500).json({ error: 'Error interno al crear ítem', details: err?.message });
  }
};
