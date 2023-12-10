import express from "express";

import {
  loginBuyer,
  logoutBuyer,
  registerBuyer,
} from "../controllers/buyerController.js";
// import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", registerBuyer);

router.post("/login", loginBuyer);

router.post("/logout", logoutBuyer);

export default router;
