// src/controllers/category.controller.js
import categoryService from '../services/category.service.js';
import { createCategorySchema, getCategoriesQuerySchema } from '../schemas/category.schema.js';

const getCategories = async (req, res) => {
  try {
    // Validación: Zod revisará si viene 'activeOnly'
    const validation = getCategoriesQuerySchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: validation.error.errors[0].message
      });
    }

    // Llamamos al servicio (que ahora tiene su propio try/catch interno)
    const categories = await categoryService.findCategories(req.query);

    return res.status(200).json({
      success: true,
      message: "Lista de categorías obtenida",
      data: categories
    });

  } catch (error) {
    // Si el servicio falla y lanza error, caemos aquí
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

export { getCategories, createCategory };