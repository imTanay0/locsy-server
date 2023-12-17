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
    }
  },
  { timestamps: true }
);

export default mongoose.model("Buyer", buyerSchema);
