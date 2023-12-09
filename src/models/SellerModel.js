import mongoose from "mongoose";

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
      type: String,
      // required: true,
    },
    shopDescription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Seller", sellerSchema);
