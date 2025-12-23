import categoryService from '../services/category.service.js';
import { createCategorySchema, getCategoriesQuerySchema, updateCategorySchema } from '../schemas/category.schema.js';

const getCategories = async (req, res) => {
  try {
    const validation = getCategoriesQuerySchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: validation.error.errors[0].message
      });
    }

    const categories = await categoryService.findCategories(req.query);

    return res.status(200).json({
      success: true,
      message: "Lista de categorías obtenida",
      data: categories
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Error interno al obtener categorías"
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const validation = createCategorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: validation.error.errors[0].message
      });
    }

    const newCategory = await categoryService.createCategory(validation.data);

    return res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente",
      data: newCategory
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Error al crear la categoría"
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const validation = updateCategorySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: validation.error.errors[0].message
      });
    }

    const updatedCategory = await categoryService.updateCategory(id, validation.data);

    return res.status(200).json({
      success: true,
      message: "Categoría actualizada correctamente",
      data: updatedCategory
    });

  } catch (error) {
    if (error.message === "NOT_FOUND" || error.message === "Categoria no encontrada") {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "La categoría no existe"
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Error interno al actualizar la categoría"
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await categoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      message: "Categoría eliminada correctamente"
    });

  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "La categoría no existe"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error al eliminar la categoría",
      error: error.message
    });
  }
};

// --- AQUÍ ESTABA EL ERROR, ESTA ES LA VERSIÓN CORREGIDA ---
export default { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
};