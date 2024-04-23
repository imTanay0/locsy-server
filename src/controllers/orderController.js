import Order from "../models/OrderModel.js";
import Buyer from "../models/BuyerModel.js";
import Product from "../models/ProductModel.js";
import User from "../models/UserModel.js";

import { STRIPE, STRIPE_WEBHOOK_SECRET, FRONTEND_URL } from "../app.js";
import {
  createLineItems,
  createSessionData,
  formatOrder,
  getProductsForOrders,
} from "../utils/order-utils.js";

export const stripeWebhookHandler = async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Webhook Error: ${error.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const order = await Order.findById(session.metadata.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = "Paid";
    order.isPaymentDone = true;
    await order.save();
    res.json({
      success: true,
      message: "Payment successful",
    });
  }
};

export const createCheckoutSession = async (req, res) => {
  const { orderedProducts, totalPrice, address } = req.body;

  if (!orderedProducts || !totalPrice || !address) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all the required fields",
    });
  }

  try {
    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const products = orderedProducts.map((product) => {
      return {
        productId: product.productId,
        orderedQuantity: product.quantity,
      };
    });

    const newOrder = new Order({
      buyerId: buyer._id,
      orderedProducts: products,
      totalPrice,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      },
      orderStatus: "Placed",
      isPaymentDone: false,
    });
    if (!newOrder) {
      return res.status(400).json({
        success: false,
        message: "Error creating order",
      });
    }

    const lineItems = createLineItems(orderedProducts);

    const session = await createSessionData(
      lineItems,
      newOrder._id.toString(),
      totalPrice,
      FRONTEND_URL
    );

    if (!session.url) {
      console.log(session.error.message);
      return res.status(500).json({
        success: false,
        message: "Error creating stripe session",
      });
    }

    await newOrder.save();
    res.status(200).json({ success: true, session: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.raw.message });
  }
};

export const getOrdersForBuyer = async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const orders = await Order.find({ buyerId: buyer._id }).sort({
      createdAt: -1,
    });
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    const products = await getProductsForOrders(orders, Product);
    const formatOrders = formatOrder(orders, products);

    return res.status(200).json({ success: true, orders: formatOrders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  if (!orderId) {
    return res.status(404).json({
      success: false,
      message: "Provide a valid Id",
    });
  }
  try {
    const buyer = await Buyer.findOne({ userId: req.user._id });
    if (!buyer) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const order = await Order.findById(orderId);
    if (!order || order.buyerId.toString() !== buyer._id.toString()) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const productPromises = order.orderedProducts.map(
      async (product) => await Product.findById(product.productId)
    );
    const products = await Promise.all(productPromises);

    const formatProducts = products.map((product) => ({
      productId: product._id,
      productName: product.productName,
      productImg: product.mainImage.image.url,
      price: product.price,
      stock: product.stock,
      sellerId: product.sellerId._id,
      quantity: order.orderedProducts.find(
        (item) => item.productId.toString() === product._id.toString()
      ).orderedQuantity,
    }));

    const date = new Date();
    const formattedOrder = {
      orderId: order._id,
      address: order.address,
      buyerId: order.buyerId,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      products: formatProducts,
      date: date.toLocaleDateString(),
    };

    res.status(200).json({ success: true, order: formattedOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
