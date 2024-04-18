import Order from "../models/OrderModel.js";
import Buyer from "../models/BuyerModel.js";
import Address from "../models/AddressModel.js";
import { STRIPE, STRIPE_WEBHOOK_SECRET } from "../app.js";
import { FRONTEND_URL } from "../app.js";

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
      totalPrice
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
