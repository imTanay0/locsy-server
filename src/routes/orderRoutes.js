import express from "express";

import {
  createCheckoutSession,
  stripeWebhookHandler,
} from "../controllers/orderController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router()

router.post("/checkout/create-checkout-session", isAuthenticated, createCheckoutSession);

router.post("/checkout/webhook", stripeWebhookHandler);

export default router;