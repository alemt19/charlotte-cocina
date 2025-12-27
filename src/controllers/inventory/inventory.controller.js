import * as inventoryService from '../../services/inventory/inventory.service.js';
import { createItemSchema, listItemsSchema, updateItemSchema, inboundSchema, outboundSchema } from '../../schemas/inventory/inventory.schema.js';

export const listItems = async (req, res) => {
  const parsed = listItemsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Query inválida', details: parsed.error.format() });
  }

  const { type, stockStatus } = parsed.data;
  try {
    const items = await inventoryService.findItems({ type, stockStatus });
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

  const { name, type, unitMeasure, minStockAlert } = parsed.data;
  const minStock = Math.round(Number(minStockAlert) || 0);

  try {
    const created = await inventoryService.createItem({
      name,
      type,
      unitMeasure,
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

export const getItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await inventoryService.getItemById(id);
    if (!item) return res.status(404).json({ error: 'Ítem no encontrado' });
    return res.json(item);
  } catch (err) {
    console.error('Error getItem:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateItem = async (req, res) => {
  const { id } = req.params;
  const parsed = updateItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Body inválido', details: parsed.error.format() });
  }

  const updates = parsed.data;
  try {
    const updated = await inventoryService.updateItem(id, updates);
    return res.json(updated);
  } catch (err) {
    console.error('Error updateItem:', err);
    return res.status(500).json({ error: 'Error interno al actualizar ítem' });
  }
};

export const registerInbound = async (req, res) => {
  const parsed = inboundSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Body inválido', details: parsed.error.format() });

  const { itemId, quantityChange, costAtTime, movementType, reason } = parsed.data;
  try {
    const result = await inventoryService.registerInbound({ itemId, quantityChange, costAtTime, movementType, reason });
    return res.status(201).json(result);
  } catch (err) {
    console.error('Error registerInbound:', err);
    return res.status(500).json({ error: 'Error interno al registrar entrada' });
  }
};

export const registerOutbound = async (req, res) => {
  const parsed = outboundSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Body inválido', details: parsed.error.format() });

  const { itemId, quantityChange, movementType, reason } = parsed.data;
  try {
    const result = await inventoryService.registerOutbound({ itemId, quantityChange, movementType, reason });
    return res.status(201).json(result);
  } catch (err) {
    console.error('Error registerOutbound:', err);
    if (err && err.code === 'INSUFFICIENT_STOCK') return res.status(400).json({ error: 'Stock insuficiente' });
    return res.status(500).json({ error: 'Error interno al registrar salida' });
  }
};

export const getItemLogs = async (req, res) => {
  const { id } = req.params;
  try {
    const logs = await inventoryService.getItemLogs(id);
    return res.json(logs);
  } catch (err) {
    console.error('Error getItemLogs:', err);
    return res.status(500).json({ error: 'Error interno al obtener logs' });
  }
};
