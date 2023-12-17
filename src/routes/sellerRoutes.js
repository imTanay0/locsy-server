import express from "express";

import {
  registerSeller,
  loginSeller,
  logoutSeller,
  getSeller,
} from "../controllers/sellerController.js";
import singleUpload from "./../middlewares/multer.js";
import { isAuthenticated } from "./../middlewares/auth.js";

const router = express.Router();

router.post("/register", singleUpload, registerSeller);

router.post("/login", loginSeller);

router.post("/logout", isAuthenticated, logoutSeller);

router.get("/", isAuthenticated, getSeller);

export default router;
