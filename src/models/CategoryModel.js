import mongoose from "mongoose";

const CategorySchema = mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("Category", CategorySchema);
