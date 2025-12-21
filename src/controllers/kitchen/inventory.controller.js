import * as inventoryService from '../../services/kitchen/inventory.service.js';
import { createItemSchema, listItemsSchema } from '../../schemas/kitchen/inventory.schema.js';

export const listItems = async (req, res) => {
  const parsed = listItemsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Query inválida', details: parsed.error.format() });
  }

  const { type, stock_status } = parsed.data;
  try {
    const items = await inventoryService.findItems({ type, stock_status });
    return res.json(items);
  } catch (err) {
    console.error('Error listItems:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createItem = async (req, res) => {
  const parsed = createItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Body inválido', details: parsed.error.format() });
  }

  const { name, type, unit_measure, min_stock_alert } = parsed.data;
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
    if (err && err.code === 'P2025_DUPLICATE') {
      return res.status(409).json({ error: 'Ítem con el mismo nombre ya existe' });
    }
    return res.status(500).json({ error: 'Error interno al crear ítem' });
  }
};
