import express from "express";

import {
  deleteLoggedInSeller,
  getSeller,
  loginSeller,
  logoutSeller,
  registerSeller,
  updateSeller,
} from "../controllers/sellerController.js";
import { isAuthenticated } from "./../middlewares/auth.js";
import singleUpload from "./../middlewares/multer.js";

const router = express.Router();

router.post("/register", singleUpload, registerSeller);

router.post("/login", loginSeller);

router.get("/logout", isAuthenticated, logoutSeller);

router.get("/", isAuthenticated, getSeller);

router.delete("/delete", isAuthenticated, deleteLoggedInSeller);

router.put("/update", singleUpload, isAuthenticated, updateSeller);

// router.delete("/delimage", testDeleteImage);

export default router;
