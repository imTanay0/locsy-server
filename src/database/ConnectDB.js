import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () => {

  const DB_URI = process.env.DB_URI;
  
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URI_LOCAL}/${DB_NAME}`
    );

    console.log("\n");
    console.log(
      `Databse connected, DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("DataBase Connection Error: ", error);
    process.exit(1);
  }
};

export default connectDB;
