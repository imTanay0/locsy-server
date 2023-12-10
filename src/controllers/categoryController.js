import Category from "../models/CategoryModel.js";

export const createCategory = async (req, res) => {
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({
      message: "Category is required",
    });
  }

  try {
    const category = await Category.findOne({ category });

    if (category) {
      return res
        .status(409)
        .json({ success: false, message: "Category already exists" });
    }

    const newCategory = await Category.create({
      category,
    });

    res.status(200).json({
      success: true,
      newCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategory = async (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({
      message: "Category is required",
    });
  }

  try {
    const category = await Category.findOne({ category });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category does not exist",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
