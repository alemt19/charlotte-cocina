import productService from '../../services/products/product.service.js';

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
      return res.status(404).json({ success: false, error: "NOT_FOUND", message: "El recurso solicitado no existe." });
    }
    next(error); 
  }
};

const createProduct = async (req, res, next) => {
  try {
    // Combinamos el body (texto) con el file (imagen)
    const productData = req.body;
    
    if (req.file) {
      productData.imageFile = req.file; // Pasamos el archivo al servicio
    }

    const newProduct = await productService.createProduct(productData);
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
    
    // CORRECCIÓN: Ahora leemos camelCase (lo que espera el frontend moderno)
    // Pero mantenemos soporte snake_case por si acaso.
    const name = req.body.name;
    const description = req.body.description;
    const basePrice = req.body.basePrice || req.body.base_price;
    const categoryId = req.body.categoryId || req.body.category_id;
    const imageUrl = req.body.imageUrl || req.body.image_url;

    if (basePrice && typeof basePrice !== 'number' && isNaN(parseFloat(basePrice))) {
        return res.status(400).json({
            success: false,
            error: "VALIDATION_ERROR",
            message: "El campo 'basePrice' debe ser un número."
        });
    }

    const dataToUpdate = {
      ...(name && { name }),
      ...(description && { description }),
      ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }), 
      ...(categoryId && { categoryId: categoryId }),
      ...(imageUrl && { imageUrl: imageUrl })
    };

    const updatedProduct = await productService.updateProduct(id, dataToUpdate);
    
    res.status(200).json({ 
      success: true, 
      message: "Producto actualizado correctamente", 
      data: updatedProduct 
    });

  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ success: false, error: "NOT_FOUND", message: "El producto no existe para editar." });
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
      return res.status(404).json({ success: false, error: "NOT_FOUND", message: "El recurso solicitado no existe." });
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
      return res.status(404).json({ success: false, error: "NOT_FOUND", message: "El producto no existe." });
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