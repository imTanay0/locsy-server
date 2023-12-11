import express from "express";

import {
  createProduct,
  getSllerProducts,
  getAllProducts,
} from "../controllers/productController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.post("/create", singleUpload, isAuthenticated, createProduct);

router.get("/get", isAuthenticated, getSllerProducts);

router.get("/getall", getAllProducts);

export default router;
