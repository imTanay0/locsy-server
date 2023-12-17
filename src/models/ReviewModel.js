import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewComment: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamp: true }
);

export default mongoose.model("Review", reviewSchema);
