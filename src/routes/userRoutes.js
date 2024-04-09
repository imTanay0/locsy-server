import express from "express";

import { register, login, logout, getLoggedInUser } from "../controllers/userController.js";
import { isAuthenticated } from './../middlewares/auth.js';

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/", isAuthenticated, getLoggedInUser);

export default router;
