import express from "express";

import {
  createProduct,
  getSellerProducts,
  getAllProducts,
  searchProducts,
  getProductByCategory,
  getLatestProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { isAuthenticated, isSeller } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.post("/create", singleUpload, isSeller, createProduct);

router.get("/get", isSeller, getSellerProducts);

router.get("/getall", getAllProducts);

router.get("/latest", getLatestProducts);

router.get("/search", searchProducts);

router.get("/search/:category", getProductByCategory);

router
  .route("/:id")
  .get(getProductById)
  .put(isSeller, singleUpload, updateProduct)
  .delete(isSeller, deleteProduct);

export default router;
