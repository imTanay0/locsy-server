import cloudinary from "cloudinary";

import Product from "../models/ProductModel.js";
import Seller from "../models/SellerModel.js";
import User from "../models/UserModel.js";
import Category from "../models/CategoryModel.js";
import getDataUri from "../utils/dataUri.js";
import {
  getCategoriesForProducts,
  getSellersForProducts,
} from "../utils/pruduct-utils/index.js";
import { getUsersForSellers } from "../utils/seller-utils/index.js";


/*
! Need Changes
export const createProduct = async (req, res) => {
  const { productName, price, productDescription, stock, categories } =
    req.body;

  // console.log("Request Body:", req.body);
  // console.log("Request File:", req.file);

  if (
    !productName ||
    !price ||
    !productDescription ||
    !stock ||
    !categories ||
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
      mainImage: {
        image: {
          public_id: mycloud.public_id,
          url: mycloud.secure_url,
        },
      },
      stock,
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

*/

export const getSllerProducts = async (req, res) => {
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

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    const sellers = await getSellersForProducts(products, Seller);
    const users = await getUsersForSellers(sellers, User);
    const categories = await getCategoriesForProducts(products, Category);

    const updatedProducts = products.map((product, idx) => {
      // Ensure users and sellers are arrays
      if (
        !Array.isArray(users) ||
        !Array.isArray(sellers) ||
        !Array.isArray(categories) ||
        !Array.isArray(categories[idx])
      ) {
        console.error("Invalid users, sellers, or categories data");
        return null;
      }

      // Find the seller corresponding to the product
      const seller = sellers.find(
        (seller) => seller._id.toString() === product.sellerId.toString()
      );

      // Find the user corresponding to the seller
      const user = users.find(
        (u) => u._id.toString() === seller.userId.toString()
      );

      // Find the categories corresponding to the product
      const productCategories = categories[idx].map((cat) => cat.category);

      // console.log("productCategories: ", productCategories);

      if (!seller || !user) {
        console.error("Seller or user not found for product: ", product._id);
        return null;
      }

      return {
        productName: product.productName,
        productDescription: product.productDescription,
        productImage: product.productImage,
        price: product.price,
        offerPrice: product.offerPrice,
        sellerName: `${user.fname} ${user.lname}`,
        productCategories,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    // Filter out null values in case of errors
    const filteredUpdatedProducts = updatedProducts.filter(
      (product) => product !== null
    );

    // console.log(filteredUpdatedProducts);

    res.status(200).json({
      success: true,
      filteredUpdatedProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    // Search for categories
    const categoryResults = await Category.find({
      category: { $regex: new RegExp(query, "i") },
    });

    if (!categoryResults || categoryResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Extract category IDs from results
    const categoryIds = categoryResults.map((category) => category._id);

    // Search for products by product name or related to the found categories
    const productResults = await Product.find({
      $or: [
        { productName: { $regex: new RegExp(query, "i") } },
        { categories: { $in: categoryIds } },
      ],
    });

    res.status(200).json({
      success: true,
      productResults,
      categoryResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const categoryResults = await Category.findOne({
      category: { $regex: new RegExp(category, "i") },
    });

    if (!categoryResults || categoryResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // console.log(categoryResults);

    let categoryIds;

    if (Array.isArray(categoryResults)) {
      categoryIds = categoryResults.map((cat) => cat._id);
    } else {
      categoryIds = categoryResults._id;
    }

    const productResults = await Product.find({
      categories: { $in: categoryIds },
    });

    if (!productResults || productResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    res.status(200).json({
      success: true,
      productResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
