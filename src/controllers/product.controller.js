import productService from '../services/product.service.js';

// --- LISTAR ---
const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts();
    res.status(200).json({ 
      success: true, 
      message: "Lista de productos obtenida correctamente",
      data: products 
    });
  } catch (error) {
    next(error);
  }
};

// --- ENDPOINT 7: Obtener por ID ---
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    
    res.status(200).json({ 
      success: true, 
      message: "Detalle del producto obtenido",
      data: product 
    });
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ 
        success: false, 
        error: "NOT_FOUND", 
        message: "El recurso solicitado no existe." 
      });
    }
    next(error); // Pasa al manejador de errores global si es otro tipo
  }
};

// --- CREAR ---
const createProduct = async (req, res, next) => {
  try {
    // Aquí deberías validar con Zod si tienes el schema listo
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json({ 
      success: true, 
      message: "Producto creado exitosamente", 
      data: newProduct 
    });
  } catch (error) {
    next(error);
  }
};

// --- ENDPOINT 8: Actualizar (PUT) ---
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Extracción de datos (Snake Case del Front -> Camel Case para el Back)
    const { name, description, base_price, category_id, image_url } = req.body;

    // Validación básica manual (para cumplir "cero errores" si falla Zod o no existe)
    if (base_price && typeof base_price !== 'number' && isNaN(parseFloat(base_price))) {
        return res.status(400).json({
            success: false,
            error: "VALIDATION_ERROR",
            message: "El campo 'base_price' debe ser un número."
        });
    }

    // Preparar objeto limpio para Prisma
    const dataToUpdate = {
      ...(name && { name }),
      ...(description && { description }),
      ...(base_price !== undefined && { basePrice: parseFloat(base_price) }), // Convertimos a número por si acaso
      ...(category_id && { categoryId: category_id }),
      ...(image_url && { imageUrl: image_url })
    };

    const updatedProduct = await productService.updateProduct(id, dataToUpdate);
    
    res.status(200).json({ 
      success: true, 
      message: "Producto actualizado correctamente", 
      data: updatedProduct 
    });

  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ 
        success: false, 
        error: "NOT_FOUND", 
        message: "El producto no existe para editar." 
      });
    }
    next(error);
  }
};

// --- ELIMINAR ---
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.status(200).json({ 
      success: true, 
      message: "Producto eliminado correctamente" 
    });
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ 
        success: false, 
        error: "NOT_FOUND", 
        message: "El recurso solicitado no existe." 
      });
    }
    next(error);
  }
};

// --- TOGGLE STATUS ---
const toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Falta el campo 'is_active' (true/false) o no es booleano."
      });
    }

    const updatedProduct = await productService.toggleProductStatus(id, is_active);

    res.status(200).json({
      success: true,
      message: "Estado del producto actualizado",
      data: updatedProduct
    });

  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ 
        success: false, 
        error: "NOT_FOUND", 
        message: "El producto no existe." 
      });
    }
    next(error);
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
};