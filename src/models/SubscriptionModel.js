import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    planDescription: {
      type: String,
      required: true,
    },
    durationMonths: {
      type: Number,
      required: true,
    },
    features: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
