import express from "express";

import {
  getLoggedInAdmin,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../controllers/adminController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Auth Routes - Admin
router.post("/register", registerAdmin);

router.post("/login", loginAdmin);

router.post("/logout", isAuthenticated, logoutAdmin);

router.get("/get", isAuthenticated, getLoggedInAdmin);

export default router;
