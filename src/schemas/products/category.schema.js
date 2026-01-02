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


// Validamos los datos que llegan para editar (PATCH)
const updateCategorySchema = z.object({
  name: z.string({
    invalid_type_error: "El nombre debe ser un texto"
  }).min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  
  isActive: z.boolean({
    invalid_type_error: "isActive debe ser true o false"
  }).optional()
}).strict(); // .strict() rechaza campos raros que no esperemos

// Exportamos también este nuevo schema
export { createCategorySchema, getCategoriesQuerySchema, updateCategorySchema };