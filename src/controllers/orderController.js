import Order from "../models/OrderModel.js";
import Buyer from "../models/BuyerModel.js";
import Address from "../models/AddressModel.js";
import { STRIPE } from "../app.js";
import { FRONTEND_URL } from "../app.js";

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

    const newOrder = await Order.create({
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
      newOrder._id,
      totalPrice
    );

    if (!session.url) {
      console.log(session.error.message);
      return res.status(500).json({
        success: false,
        message: "Error creating stripe session",
      });
    }

    res.status(200).json({ success: true, session: session.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.raw.message });
  }
};

const createLineItems = (orderedProducts) => {
  return orderedProducts.map((product) => {
    return {
      price_data: {
        currency: "INR",
        product_data: {
          name: product.productName,
          description: product.productDescription,
        },
        unit_amount: product.price * 100,
      },
      quantity: product.quantity,
    };
  });
};

const createSessionData = async (lineItems, orderId, totalPrice) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    metadata: {
      orderId,
      totalPrice,
    },
    success_url: `${FRONTEND_URL}/ordrer-status?success=true`,
    cancel_url: `${FRONTEND_URL}/cart?canceled=true`,
  });

  return sessionData;
};
