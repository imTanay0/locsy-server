import express from "express";

import {
  registerSeller,
  loginSeller,
  logoutSeller,
} from "../controllers/sellerController.js";
import singleUpload from "./../middlewares/multer.js";

const router = express.Router();

router.post("/register", singleUpload, registerSeller);

router.post("/login", loginSeller);

router.post("/logout", logoutSeller);

export default router;
