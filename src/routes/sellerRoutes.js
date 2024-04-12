import express from "express";

import {
  registerSeller,
  loginSeller,
  logoutSeller,
  getSeller,
  deleteLoggedInSeller,
  testDeleteImage,
} from "../controllers/sellerController.js";
import singleUpload from "./../middlewares/multer.js";
import { isAuthenticated } from "./../middlewares/auth.js";

const router = express.Router();

router.post("/register", singleUpload, registerSeller);

router.post("/login", loginSeller);

router.get("/logout", isAuthenticated, logoutSeller);

router.get("/", isAuthenticated, getSeller);

router.delete("/delete", isAuthenticated, deleteLoggedInSeller);

router.delete("/delimage", testDeleteImage);

export default router;
