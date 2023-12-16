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
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    shopDescription: {
      type: String,
      required: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvalDetails: {
      reason: String,
      adminUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Seller", sellerSchema);
