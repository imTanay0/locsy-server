import dotenv from "dotenv";
import cloudinary from "cloudinary";

import connectDB from "./database/ConnectDB.js";
import { app } from "./app.js";

// Config
dotenv.config({ path: ".env" });
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

// Database Connection
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Server Connection FAILED: ${err}`);
  });
