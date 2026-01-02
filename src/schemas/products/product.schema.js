import { z } from 'zod';

// 1. Esquema para CREAR un producto (POST)
export const createProductSchema = z.object({
  body: z.object({ // <--- AHORA SÍ TIENE EL WRAPPER 'BODY'
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
    basePrice: z.number({
      invalid_type_error: "El precio debe ser un número",
      required_error: "El precio es obligatorio"
    }).positive("El precio debe ser mayor a 0"),
    categoryId: z.string().uuid("El ID de categoría debe ser válido"),
    imageUrl: z.string().url("Debe ser una URL válida").optional(),
    isActive: z.boolean().optional()
  })
});

// 2. Esquema para FILTROS de búsqueda (GET)
export const getProductsQuerySchema = z.object({
  query: z.object({ // <--- AHORA SÍ TIENE EL WRAPPER 'QUERY'
    activeOnly: z.enum(['true', 'false']).optional(),
    categoryId: z.string().uuid().optional()
  })
});

// 3. Esquema para ACTUALIZAR (PATCH)
export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial() // Usamos .shape.body para acceder a lo de adentro
});

// 4. Esquema para CAMBIAR ESTADO (PATCH /status)
export const toggleProductStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean({
      required_error: "El campo isActive es obligatorio",
      invalid_type_error: "isActive debe ser un booleano (true/false)"
    })
  })
});