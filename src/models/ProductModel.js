import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
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
    discount: {
      type: Number,
      default: 0,
    },
    mainImage: {
      image: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    },
    subImages: [
      {
        subImage: {
          public_id: {
            type: String,
          },
          url: {
            type: String,
          },
        },
      },
    ],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
    rating: {
      type: Number,
    },
    categories: [
      {
        categoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      },
    ],
    stock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
