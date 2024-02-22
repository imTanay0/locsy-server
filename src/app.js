import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import multer from "multer";

import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";

// CONFIG
const app = express();
const upload = multer();

// MIDDLEWARES
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// app.use(upload.single());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(bodyParser.json({ limit: "20mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("common"));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// ROUTES
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/seller", sellerRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/buyer", buyerRoutes);

app.get("/", (req, res) => res.send(`Hello Admin`));

export { app };
