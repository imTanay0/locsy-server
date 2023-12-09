import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    reviewComment: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  { timestamp: true }
);

export default mongoose.model("Review", reviewSchema);
