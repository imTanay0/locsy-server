import cloudinary from "cloudinary";

import Product from "../models/ProductModel.js";
import Seller from "../models/SellerModel.js";
import User from "../models/UserModel.js";
import Category from "../models/CategoryModel.js";
import getDataUri from "../utils/dataUri.js";

export const createProduct = async (req, res) => {
  const { productName, price, productDescription, rating, categories } =
    req.body;

  // console.log("Request Body:", req.body);
  // console.log("Request File:", req.file);

  if (
    !productName ||
    !price ||
    !productDescription ||
    !rating ||
    categories.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all fields",
    });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== 2) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const seller = await Seller.findOne({ userId: user._id });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Upload Product Image
    const file = req.file;
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    // Check if categories exist, create if not
    const categoryPromises = categories.map(async (category) => {
      const existingCategory = await Category.findOne({ category });
      return existingCategory || Category.create({ category });
    });

    const resolvedCategories = await Promise.all(categoryPromises);

    const newProduct = await Product.create({
      productName,
      productDescription,
      price,
      productImage: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      rating,
      categories: resolvedCategories.map((cat) => cat._id),
      sellerId: seller._id,
    });

    res.status(201).json({
      success: true,
      newProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== 2) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const seller = await Seller.findOne({ userId: user._id });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const products = await Product.find({ sellerId: seller._id });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
