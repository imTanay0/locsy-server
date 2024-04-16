import Cart from "../models/CartModel.js";
import Product from "../models/ProductModel.js";
import Buyer from "../models/BuyerModel.js";
import User from "../models/UserModel.js";

export const createCart = async (req, res) => {
  const { productId } = req.body;

  if (!productId || typeof productId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID. Please provide a valid string.",
    });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const buyer = await Buyer.findOne({ userId: user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found.",
      });
    }

    const cart = await Cart.findOne({ buyerId: buyer._id });
    if (cart) {
      return res.status(409).json({
        success: false,
        message: "Cart already exists.",
      });
    }

    const newCart = await Cart.create({
      buyerId: buyer._id,
      products: [{ productId, quantity: 1 }],
      totalPrice: product.price,
      totalItems: 1,
    });

    if (!newCart) {
      return res.status(500).json({
        success: false,
        message: "Failed to create cart. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart created successfully.",
      cart: newCart,
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
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found.",
      });
    }

    // Find the existing cart and handle potential errors
    const cart = await Cart.findOne({ buyerId: buyer._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found for this user.",
      });
    }

    // Find the existing product index (if any)
    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.productId === productId
    );

    // Update cart items and total values
    if (existingProductIndex !== -1) {
      console.log("product already exists");
      cart.products[existingProductIndex].quantity += 1;
    } else {
      console.log("product not exists");
      cart.products.push({ productId, quantity: 1 });
    }
    cart.totalPrice += product.price;
    cart.totalItems += 1;

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

    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found.",
      });
    }

    // Find the cart and handle potential errors
    const cart = await Cart.findOne({ buyerId: buyer._id });
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

export const increaseCartItemQuantity = async (req, res) => {
  const { productId } = req.body;
  try {
    // Validate input - Ensure productId is a string
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID. Please provide a valid string.",
      });
    }

    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found.",
      });
    }

    // Find the cart and handle potential errors
    const cart = await Cart.findOne({ buyerId: buyer._id });
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
    cart.totalPrice +=
      cart.products[productIndex].price * cart.products[productIndex].quantity;
    cart.totalItems += cart.products[productIndex].quantity;
    cart.products[productIndex].quantity++;

    // Save the updated cart and handle potential errors
    const savedCart = await cart.save();

    if (!savedCart) {
      return res.status(500).json({
        success: false,
        message: "Failed to increase item quantity. Please try again later.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Item quantity increased successfully.",
      cart: savedCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const decreaseCartItemQuantity = async (req, res) => {
  const { productId } = req.body;
  try {
    // Validate input - Ensure productId is a string
    if (!productId || typeof productId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID. Please provide a valid string.",
      });
    }

    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found.",
      });
    }

    // Find the cart and handle potential errors
    const cart = await Cart.findOne({ buyerId: buyer._id });
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
      cart.products[productIndex].price * cart.products[productIndex].quantity;
    cart.totalItems -= cart.products[productIndex].quantity;
    cart.products[productIndex].quantity--;

    // Save the updated cart and handle potential errors
    const savedCart = await cart.save();

    if (!savedCart) {
      return res.status(500).json({
        success: false,
        message: "Failed to decrease item quantity. Please try again later.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Item quantity decreased successfully.",
      cart: savedCart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCart = async (req, res) => {
  if (!req.user._id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized.",
    });
  }

  try {
    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found.",
      });
    }

    const cart = await Cart.findOne({ buyerId: buyer._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found for this user.",
      });
    }
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find({});
    if (!carts || carts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No carts found",
      });
    }

    res.status(200).json({ success: true, carts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
