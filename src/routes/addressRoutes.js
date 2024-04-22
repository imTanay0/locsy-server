import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";
import {
  addAddress,
  getAllAddressForBuyer,
  removeAddress,
} from "../controllers/addressController.js";

const router = express.Router();

router.post("/add", isAuthenticated, addAddress);

router.get("/get", isAuthenticated, getAllAddressForBuyer);

router.route("/:addressId").delete(isAuthenticated, removeAddress);

export default router;
