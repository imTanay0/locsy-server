import express from "express";

import {
  createCheckoutSession,
} from "../controllers/orderController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router()

router.post("/checkout/create-checkout-session", isAuthenticated, createCheckoutSession);

export default router;