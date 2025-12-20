// src/schemas/category.schema.js
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string({
    required_error: "El nombre es obligatorio",
    invalid_type_error: "El nombre debe ser un texto"
  }).min(3, "El nombre debe tener al menos 3 caracteres")
});

// CAMBIO: Ahora validamos 'activeOnly' (camelCase)
const getCategoriesQuerySchema = z.object({
  activeOnly: z.enum(['true', 'false']).optional()
});

export { createCategorySchema, getCategoriesQuerySchema };