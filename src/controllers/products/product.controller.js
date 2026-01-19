import productService from '../../services/products/product.service.js';
import { createProductSchema, updateProductSchema } from '../../schemas/products/product.schema.js';

const getProducts = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const categoryId = req.query.categoryId;

    const products = await productService.getProducts({ activeOnly, categoryId });
    
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
    const productData = { ...req.body };
    
    if (productData.basePrice) productData.basePrice = parseFloat(productData.basePrice);
    if (productData.isActive) productData.isActive = productData.isActive === 'true';

    const validation = createProductSchema.shape.body.safeParse(productData);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: validation.error.errors[0].message
      });
    }

    if (req.file) {
      productData.imageFile = req.file;
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
    const validation = updateProductSchema.shape.body.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: validation.error.errors[0].message
      });
    }

    const updatedProduct = await productService.updateProduct(id, req.body);
    
    res.status(200).json({
      success: true,
      message: "Producto actualizado",
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined || typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Falta el campo 'isActive' (boolean)."
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

const getProductRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await productService.getProductRecipe(id);
    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.checkProductAvailability(id);
    res.json(result);
  } catch (error) {
    next(error);
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