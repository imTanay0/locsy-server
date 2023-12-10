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

// // Hash Password before saving
// sellerSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     try {
//       const hashedPassword = await bcrypt.hash(this.password, 10);
//       this.password = hashedPassword;
//     } catch (error) {
//       next(error);
//       console.log(`Error: ${error}`);
//     }
//   }
//   next();
// });

// // Generate JWT Token
// sellerSchema.methods.getJWTToken = function () {
//   return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
//     expiresIn: "15d",
//   });
// };

// // Compare password
// sellerSchema.methods.comparePassword = async function (password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (error) {
//     throw error;
//   }
// };

export default mongoose.model("Seller", sellerSchema);
