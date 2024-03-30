import express from "express";

import {
  addCartItem,
  createCart,
  deleteCartItem,
} from "../controllers/cartController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isAuthenticated, createCart);

router.put("/add-item", isAuthenticated, addCartItem);

router.delete("/delete-item", isAuthenticated, deleteCartItem);

export default router;
