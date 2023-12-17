import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
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
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
