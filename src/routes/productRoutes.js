import express from "express";

import { createProduct } from "../controllers/productController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.post("/create", singleUpload, isAuthenticated, createProduct);

export default router;
