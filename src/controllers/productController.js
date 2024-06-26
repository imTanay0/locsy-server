import cloudinary from "cloudinary";
import Fuse from "fuse.js";

import Category from "../models/CategoryModel.js";
import Product from "../models/ProductModel.js";
import Seller from "../models/SellerModel.js";
import User from "../models/UserModel.js";
import getDataUri from "../utils/dataUri.js";
import {
  formatSearchedProducts,
  getCategoriesForProducts,
  getSellersForProducts,
} from "../utils/pruduct-utils/index.js";
import { getUsersForSellers } from "../utils/seller-utils/index.js";

export const createProduct = async (req, res) => {
  const { productName, price, productDescription, stock, categories } =
    req.body;

  // console.log("Request Body:", req.body);
  // console.log("Request File:", req.file);

  if (!productName || !price || !productDescription || !stock) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all fields",
    });
  }

  try {
    const seller = await Seller.findById(req.seller._id);

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
    let categoryPromises = [];

    if (!!categories && categories.length > 0) {
      categoryPromises = categories.map(async (category) => {
        const existingCategory = await Category.findOne({ category });
        return existingCategory || Category.create({ category });
      });
    }

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
      message: "Product created successfully",
      newProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id);

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

    // console.log(products);

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
      if (
        !Array.isArray(users) ||
        !Array.isArray(sellers) ||
        !Array.isArray(categories) ||
        !Array.isArray(categories[idx])
      ) {
        console.error("Invalid users, sellers, or categories data");
        return null;
      }

      const seller = sellers.find(
        (seller) => seller._id.toString() === product.sellerId.toString()
      );

      const user = users.find(
        (u) => u._id.toString() === seller.userId.toString()
      );

      const productCategories = categories[idx].map((cat) => cat.category);

      if (!seller || !user) {
        console.error("Seller or user not found for product: ", product._id);
        return null;
      }

      return {
        productId: product._id,
        productName: product.productName,
        productDescription: product.productDescription,
        productImage: product.mainImage.image.url,
        price: product.price,
        offerPrice: product.offerPrice,
        sellerName: `${user.fname} ${user.lname}`,
        productCategories,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    const filteredUpdatedProducts = updatedProducts.filter(
      (product) => product !== null
    );

    res.status(200).json({
      success: true,
      filteredUpdatedProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHomePageProducts = async (_, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(4);

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

export const getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(3);

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

export const searchProducts = async (req, res) => {
  const { productName } = req.query;

  if (productName === " " || productName === "") {
    return res.status(404).json({
      success: false,
      message: "No products found",
    });
  }

  try {
    const fuseOptions = {
      shouldSort: true,
      threshold: 0.4,
      location: 0,
      distance: 1000,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ["productName", "name"],
    };

    const products = await Product.find({});

    const fuse = new Fuse(products, fuseOptions);
    const searchedList = fuse.search(productName);

    if (!searchedList || searchedList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    const formattedProducts = formatSearchedProducts(searchedList);

    res.status(200).json({
      success: true,
      products: formattedProducts,
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

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, productDescription, price, stock } = req.body;
    const file = req.file;

    const product = await Product.findById(id);

    if (!product) {
      return req.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (file) {
      const { result } = await cloudinary.v2.uploader.destroy(
        product.mainImage.image.public_id
      );

      if (result !== "ok") {
        return res.status(400).json({
          success: false,
          message: "Failed to delete image",
        });
      }

      const fileUri = getDataUri(file);
      const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
      product.mainImage = {
        image: {
          public_id: mycloud.public_id,
          url: mycloud.secure_url,
        },
      };
    }

    if (productName) product.productName = productName;
    if (productDescription) product.productDescription = productDescription;
    if (price) product.price = price;
    if (stock) product.stock = stock;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { result } = await cloudinary.v2.uploader.destroy(
      product.mainImage.image.public_id
    );

    if (result !== "ok") {
      return res.status(400).json({
        success: false,
        message: "Failed to delete image",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const filterProducts = async (req, res) => {
  const { sort, maxPrice } = req.query;

  if (!sort && !maxPrice) {
    return res.status(400).json({
      success: false,
      message: "Please provide at least one filter",
    });
  }

  try {
    let products;

    if (maxPrice) {
      products = await Product.find({
        price: { $lte: maxPrice },
      }).sort({ price: sort === "asc" ? 1 : -1 });
    } else {
      products = await Product.find().sort({ price: sort === "asc" ? 1 : -1 });
    }

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    }

    const sellers = await getSellersForProducts(products, Seller);
    const users = await getUsersForSellers(sellers, User);
    const categories = await getCategoriesForProducts(products, Category);

    const updatedProducts = products.map((product, idx) => ({
      productId: product._id,
      productName: product.productName,
      productDescription: product.productDescription,
      productImage: product.mainImage.image.url,
      price: product.price,
      offerPrice: product.offerPrice,
      sellerName: users[idx].fname + " " + users[idx].lname,
      productCategories: categories?.[idx]?.map((cat) => cat.category),
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    const filteredUpdatedProducts = updatedProducts.filter(
      (product) => product !== null
    );

    res.status(200).json({ success: true, products: filteredUpdatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
