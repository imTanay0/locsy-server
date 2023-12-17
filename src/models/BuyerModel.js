import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentInformation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentInformation",
    },
    addresses: [
      {
        address: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Address",
        },
        isDefault: {
          type: Boolean,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Buyer", buyerSchema);
