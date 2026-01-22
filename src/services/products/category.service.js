import { prisma } from '../../db/client.js';

const getCategories = async (query = {}) => {
  // Si query.activeOnly está definido, filtramos por ese valor
  let where = {};
  if (typeof query.activeOnly !== 'undefined') {
    // Acepta 'true', 'false', true, false
    if (typeof query.activeOnly === 'string') {
      where.isActive = query.activeOnly === 'true';
    } else {
      where.isActive = !!query.activeOnly;
    }
  }
  return await prisma.kitchenCategory.findMany({ where });
};

const getCategoryById = async (id) => {
  const category = await prisma.kitchenCategory.findUnique({
    where: { id: id }
  });
  if (!category) throw new Error("NOT_FOUND");
  return category;
};

const createCategory = async (data) => {
  const existing = await prisma.kitchenCategory.findFirst({
    where: { name: data.name }
  });
  if (existing) throw new Error("ALREADY_EXISTS");

  return await prisma.kitchenCategory.create({
    data: {
      name: data.name,
      isActive: data.isActive ?? true
    }
  });
};

const updateCategory = async (id, data) => {
  const exists = await prisma.kitchenCategory.findUnique({ where: { id } });
  if (!exists) throw new Error("NOT_FOUND");

  return await prisma.kitchenCategory.update({
    where: { id },
    data: data
  });
};
const deleteCategory = async (id) => {
  const exists = await prisma.kitchenCategory.findUnique({ where: { id } });
  if (!exists) throw new Error("NOT_FOUND");

  return await prisma.kitchenCategory.update({
    where: { id },
    data: { isActive: false }
  });
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};