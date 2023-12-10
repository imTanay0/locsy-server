import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto-js";

const sellerSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    shopName: {
      type: String,
      required: true,
    },
    shopImage: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    shopDescription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Seller", sellerSchema);
