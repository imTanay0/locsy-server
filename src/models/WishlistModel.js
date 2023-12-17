import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);
