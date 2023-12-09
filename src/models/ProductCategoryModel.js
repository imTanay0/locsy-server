import mongoose from "mongoose";

const productCategorySchema = mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
});

export default mongoose.model("ProductCategory", productCategorySchema);
