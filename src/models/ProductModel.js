import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    offerPrice: {
      type: Number,
      default: 0,
    },
    productImage: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
    rating: {
      type: Number,
    },
    // category: [
    //   {
    //     categoryId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Category",
    //     },
    //   },
    // ],
    categories: [String],
    stock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
