import express from "express";

import { createCart } from "../controllers/cartController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, createCart);

export default router;
