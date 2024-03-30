import express from "express";

import {
  addCartItem,
  createCart,
  decreaseCartItemQuantity,
  deleteCartItem,
  increaseCartItemQuantity,
} from "../controllers/cartController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isAuthenticated, createCart);

router.put("/add-item", isAuthenticated, addCartItem);

router.delete("/delete-item", isAuthenticated, deleteCartItem);

router.put("/increaseItem", isAuthenticated, increaseCartItemQuantity);

router.put("/decreaseItem", isAuthenticated, decreaseCartItemQuantity);

export default router;
