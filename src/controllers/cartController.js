import Cart from "../models/CartModel.js";
import Product from "../models/ProductModel.js";
import Buyer from "../models/BuyerModel.js";
import User from "../models/UserModel.js";

export const createCart = async (req, res) => {
  const { productId } = req.body;

  try {
    // Validate input - Ensure productId is a valid string
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID. Please provide a valid string.",
      });
    }

    // Fetch the product and handle potential errors
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Create a new cart with proper initialization
    const newCart = new Cart({
      buyerId: req.user._id,
      products: [{ product: product._id, quantity: 1 }],
      totalPrice: product.price,
      totalItems: 1,
    });

    // Save the new cart and handle potential errors
    const savedCart = await newCart.save();
    if (!savedCart) {
      return res.status(500).json({
        success: false,
        message: "Failed to create cart. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart created successfully.",
      cart: savedCart,
    });
  } catch (error) {
    console.error("Error creating cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

export const addCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // Validate input - Ensure productId is a string and quantity is a positive number
    if (
      !productId ||
      typeof productId !== "string" ||
      typeof quantity !== "number" ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID or quantity. Please provide a valid string ID and a positive quantity.",
      });
    }

    // Fetch the product and handle potential errors
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Find the existing cart and handle potential errors
    const cart = await Cart.findOne({ buyerId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found for this user.",
      });
    }

    // Find the existing product index (if any)
    const existingProductIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    // Update cart items and total values
    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }
    cart.totalPrice += product.price * quantity;
    cart.totalItems += quantity;

    // Save the updated cart and handle potential errors
    const savedCart = await cart.save();
    if (!savedCart) {
      return res.status(500).json({
        success: false,
        message: "Failed to add item to cart. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully.",
      cart: savedCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCartItem = async (req, res) => {
  const { productId } = req.body;
  try {
    // Validate input - Ensure productId is a string
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID. Please provide a valid string.",
      });
    }
    // Find the cart and handle potential errors
    const cart = await Cart.findOne({ buyerId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found for this user.",
      });
    }
    // Find the product index and handle potential errors
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart.",
      });
    }
    // Update cart items and total values
    cart.totalPrice -=
      cart.products[productIndex].quantity * cart.products[productIndex].price;
    cart.totalItems -= cart.products[productIndex].quantity;
    cart.products.splice(productIndex, 1);
    // Save the updated cart and handle potential errors
    const savedCart = await cart.save();
    if (!savedCart) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete item from cart. Please try again later.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Item deleted from cart successfully.",
      cart: savedCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
