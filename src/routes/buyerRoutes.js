import express from "express";

import {
  deleteLoggedInBuyer,
  getLoggedInBuyer,
  loginBuyer,
  logoutBuyer,
  registerBuyer,
} from "../controllers/buyerController.js";
import { isAuthenticated } from "./../middlewares/auth.js";

const router = express.Router();

// Auth Routes - Buyer
router.post("/register", registerBuyer);

router.post("/login", loginBuyer);

router.post("/logout", isAuthenticated, logoutBuyer);

router.get("/", isAuthenticated, getLoggedInBuyer);

router.delete("/delete", isAuthenticated, deleteLoggedInBuyer);

export default router;
