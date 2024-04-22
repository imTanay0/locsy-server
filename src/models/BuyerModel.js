import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    addresses: [
      {
        addressId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Address",
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        contactNo: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Buyer", buyerSchema);
