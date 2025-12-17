import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

export const getCategories = async (req, res) => {
  try {
    const { active_only } = req.query;
    const categories = await prisma.kitchenCategory.findMany({
      where: active_only === 'true' ? { isActive: true } : {},
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    const newCategory = await prisma.kitchenCategory.create({
      data: { name: name.trim() }
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: "Error al crear categoría" });
  }
};