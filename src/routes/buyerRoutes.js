import express from "express";

import {
  deleteLoggedInBuyer,
  getLoggedInBuyer,
  loginBuyer,
  logoutBuyer,
  registerBuyer,
  updateBuyer,
} from "../controllers/buyerController.js";
import { isAuthenticated } from "./../middlewares/auth.js";

const router = express.Router();

// Auth Routes - Buyer
router.post("/register", registerBuyer);

router.post("/login", loginBuyer);

router.get("/logout", isAuthenticated, logoutBuyer);

router.get("/", isAuthenticated, getLoggedInBuyer);

router.delete("/delete", isAuthenticated, deleteLoggedInBuyer);

router.put("/update", isAuthenticated, updateBuyer);

export default router;
