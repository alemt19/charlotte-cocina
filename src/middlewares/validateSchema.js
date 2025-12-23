import { z } from 'zod';

export const validateSchema = (schema) => (req, res, next) => {
  try {
    // Validamos body, query y params al mismo tiempo
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Error de validación",
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};