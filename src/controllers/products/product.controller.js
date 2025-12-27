import productService from '../services/product.service.js';

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
    next(error); 
  }
};

const createProduct = async (req, res, next) => {
  try {
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

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { name, description, base_price, category_id, image_url } = req.body;

    if (base_price && typeof base_price !== 'number' && isNaN(parseFloat(base_price))) {
        return res.status(400).json({
            success: false,
            error: "VALIDATION_ERROR",
            message: "El campo 'base_price' debe ser un número."
        });
    }

    const dataToUpdate = {
      ...(name && { name }),
      ...(description && { description }),
      ...(base_price !== undefined && { basePrice: parseFloat(base_price) }), 
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

const toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body; 

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Falta el campo 'isActive' (true/false) o no es booleano."
      });
    }

    const updatedProduct = await productService.toggleProductStatus(id, isActive);
    
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

// Endpoint 10
const getProductRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await productService.getProductRecipe(id);
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint 11
const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.checkProductAvailability(id);
    res.json(result);
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(500).json({ error: error.message });
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductRecipe,   
  checkAvailability
};