import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
    },
    orderedProducts: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        orderedQuantity: {
          type: Number,
          required: true,
          min: [1, "Quantity can not be less then 1."],
          default: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    discountedOrderPrice: {
      type: Number,
      default: 0,
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
    orderStatus: {
      type: String,
      enum: ["Placed", "Paid", "Shipped", "Canceled", "Delivered"],
    },
    paymentId: {
      type: String,
    },
    paymentInformation: {
      type: String,
    },
    isPaymentDone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
