// Forzamos la importación directa para evitar el error de 'undefined'
import { prisma } from '../db/client.js';

const getProducts = async () => {
  return await prisma.product.findMany();
};

const createProduct = async (data) => {
  return await prisma.product.create({ data });
};

const updateProduct = async (id, data) => {
  return await prisma.product.update({
    where: { id },
    data
  });
};

const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id }
  });
};

const toggleProductStatus = async (id, isActiveValue) => {
  // Validación de seguridad para que el servidor no explote
  if (!prisma || !prisma.product) {
    console.error("ERROR: No se puede conectar con Prisma. Revisa src/db/client.js");
    throw new Error("DB_CONNECTION_ERROR");
  }

  const cleanId = id.trim();

  // Ejecutamos la actualización directamente
  return await prisma.product.update({
    where: { id: cleanId },
    data: {
      isActive: isActiveValue
    }
  });
};

export default {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
};