import express from "express";

import {
  addCartItem,
  createCart,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
  deleteCartItem,
  getCart,
  getAllCarts,
} from "../controllers/cartController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isAuthenticated, createCart);

router.put("/add-item", isAuthenticated, addCartItem);

router.delete("/delete-item", isAuthenticated, deleteCartItem);

router.put("/increaseItem", isAuthenticated, increaseCartItemQuantity);

router.put("/decreaseItem", isAuthenticated, decreaseCartItemQuantity);

router.get("/get", isAuthenticated, getCart);

router.get("/getall", getAllCarts);

export default router;
