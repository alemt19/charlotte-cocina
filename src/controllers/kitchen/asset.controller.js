import * as assetService from '../../services/kitchen/asset.service.js';
import { createAssetSchema, updateAssetSchema, listAssetsSchema } from '../../schemas/kitchen/asset.schema.js';

export const createAsset = async (req, res) => {
  const parsed = createAssetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Body inválido', details: parsed.error.format() });

  try {
    const created = await assetService.createAsset(parsed.data);
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error createAsset:', err);
    return res.status(500).json({ error: 'Error interno al crear activo' });
  }
};

export const listAssets = async (req, res) => {
  const parsed = listAssetsSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Query inválida', details: parsed.error.format() });

  try {
    const assets = await assetService.listAssets(parsed.data);
    return res.json(assets);
  } catch (err) {
    console.error('Error listAssets:', err);
    return res.status(500).json({ error: 'Error interno al listar activos' });
  }
};

export const getAsset = async (req, res) => {
  const { id } = req.params;
  try {
    const asset = await assetService.getAssetById(id);
    if (!asset) return res.status(404).json({ error: 'Activo no encontrado' });
    return res.json(asset);
  } catch (err) {
    console.error('Error getAsset:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
};

export const updateAsset = async (req, res) => {
  const { id } = req.params;
  const parsed = updateAssetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Body inválido', details: parsed.error.format() });

  try {
    const updated = await assetService.updateAsset(id, parsed.data);
    return res.json(updated);
  } catch (err) {
    console.error('Error updateAsset:', err);
    return res.status(500).json({ error: 'Error interno al actualizar activo' });
  }
};
