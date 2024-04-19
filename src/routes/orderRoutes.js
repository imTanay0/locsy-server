import express from "express";

import {
  createCheckoutSession,
  getOrdersForBuyer,
  stripeWebhookHandler,
} from "../controllers/orderController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/checkout/create-checkout-session",
  isAuthenticated,
  createCheckoutSession
);

router.post("/checkout/webhook", stripeWebhookHandler);

router.get("/get", isAuthenticated, getOrdersForBuyer);

export default router;
