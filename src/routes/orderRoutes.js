import express from "express";

import {
  createCheckoutSession,
  getOrderById,
  getOrdersForBuyer,
  getOrdersForSellers,
  stripeWebhookHandler,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { isAuthenticated, isSeller } from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/checkout/create-checkout-session",
  isAuthenticated,
  createCheckoutSession
);

router.post("/checkout/webhook", stripeWebhookHandler);

router.get("/get", isAuthenticated, getOrdersForBuyer);

router.get("/seller", isSeller, getOrdersForSellers);

router.put("/update-status", isSeller, updateOrderStatus);

router.route("/:orderId").get(isAuthenticated, getOrderById);

export default router;
