import productService from '../services/product.service.js';

const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedProduct = await productService.updateProduct(id, req.body);
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.status(200).json({ success: true, message: "Producto eliminado" });
  } catch (error) {
    next(error);
  }
};

const toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body; 

    // Validamos que el ID no sea undefined
    if (!id) throw new Error("ID_REQUIRED");

    const updatedProduct = await productService.toggleProductStatus(id, is_active);
    
    res.status(200).json({
      success: true,
      message: `Producto ${updatedProduct.isActive ? 'activado' : 'desactivado'} correctamente`,
      data: {
        id: updatedProduct.id,
        isActive: updatedProduct.isActive
      }
    });
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "El producto no existe."
      });
    }
    next(error);
  }
};

export default {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
};