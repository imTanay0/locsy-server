import mongoose from "mongoose";
import validator from "validator";

const userSchema = mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
    },
    lname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: validator.isEmail,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be atleast 6 characters"],
      select: false,
    },
    contactNo: {
      type: String,
      default: "0",
    },
    address: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      zipCode: {
        type: String,
      },
      country: {
        type: String,
        default: "India",
      },
    },
    role: {
      type: Number,
      enum: [1, 2, 3], // 1 -> Admin, 2 -> Seller, 3 -> Buyer
      default: 3,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
