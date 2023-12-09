import dotenv from "dotenv";

import connectDB from "./database/ConnectDB.js";
import { app } from "./app.js";

// Config
dotenv.config({ path: ".env" });

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
