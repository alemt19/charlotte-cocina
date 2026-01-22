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

    const imageUrl = req.body.imageUrl || req.body.image_url;
    if (!req.file && !imageUrl) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "La imagen es obligatoria. Sube un archivo en el campo 'image' o envía 'imageUrl'."
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

    const { name, description, basePrice, categoryId, imageUrl } = req.body;

    const dataToUpdate = {
      ...(name && { name }),
      ...(description && { description }),
      ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }), 
      ...(categoryId && { categoryId: categoryId }),
      ...(imageUrl && { imageUrl: imageUrl })
    };

    if (req.file) {
      dataToUpdate.imageFile = req.file;
    }

    const updatedProduct = await productService.updateProduct(id, dataToUpdate);
    
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
    const result = await productService.checkAvailability(id);
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