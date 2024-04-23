import { STRIPE } from "../app.js";

export const createLineItems = (orderedProducts) => {
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

export const createSessionData = async (
  lineItems,
  orderId,
  totalPrice,
  FRONTEND_URL
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    metadata: {
      orderId,
      totalPrice,
    },
    success_url: `${FRONTEND_URL}/orders/${orderId}`,
    cancel_url: `${FRONTEND_URL}/cart`,
  });

  return sessionData;
};

export const getProductsForOrders = async (orders, Product) => {
  try {
    const orderedProducts = orders.map((order) => order.orderedProducts);

    const productPromises = orderedProducts.map(async (perOrder, idx) => {
      const dataPromises = perOrder.map(
        async (product) =>
          await Product.findById(product.productId).populate("sellerId")
      );

      return await Promise.all(dataPromises);
    });

    const products = await Promise.all(productPromises);

    return products;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const formatOrder = (orders, products) => {
  const resolve2D = products.map((product1D) => {
    const formatProducts = product1D.map((product) => ({
      productId: product._id,
      productName: product.productName,
      productImg: product.mainImage.image.url,
      price: product.price,
      stock: product.stock,
      sellerId: product.sellerId._id,
    }));

    return formatProducts;
  });

  const data = orders.map((order, idx) => ({
    orderId: order._id,
    address: order.address,
    buyerId: order.buyerId,
    totalPrice: order.totalPrice,
    orderStatus: order.orderStatus,
    products: resolve2D[idx],
    date: order.createdAt.toLocaleDateString(),
  }));

  return data;
};

export const getSellerForOrders = async (orders, Order, seller, products) => {
  try {
    const orderDetailsPromises = orders.map(async (order) => {
      return await Order.findById(order._id).populate(
        "orderedProducts.productId"
      );
    });

    const orderDetails = await Promise.all(orderDetailsPromises);

    const sellersPromises = orderDetails.map(
      async (orderDetail) =>
        await orderDetail.populate("orderedProducts.productId.sellerId")
    );

    const ordersWithSellers = await Promise.all(sellersPromises);

    const sellersIds2d = ordersWithSellers.map((order, i) => {
      const data = order.orderedProducts.map((item) => item.productId.sellerId);
      return data.map((item) => item._id);
    });

    const sellerIds = sellersIds2d.map((arr2d) => {
      return arr2d.filter((arr) => seller._id.toString() === arr.toString());
    });

    const selledProducts = orderDetails.map((order, i) => {
      const products = order.orderedProducts.filter(
        (item) =>
          item.productId.sellerId._id.toString() === seller._id.toString()
      );
      return {
        products,
        i,
      };
    });

    const data = sellerIds.map((item, i) => ({
      order: {
        orderId: orders[i]._id,
        totalPrice: orders[i].totalPrice,
        orderStatus: orders[i].orderStatus,
        isPaymentDone: orders[i].isPaymentDone,
        date: orders[i].createdAt.toLocaleDateString(),
      },
      sellerId: item[0],
      products:
        selledProducts[i].products[0] &&
        selledProducts[i].products.map((product) => {
          return {
            productId: product.productId._id,
            productName: product.productId.productName,
            productImg: product.productId.mainImage.image.url,
            price: product.productId.price,
            stock: product.productId.stock,
          };
        }),
    }));

    const result = data.filter((item) => item.sellerId);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
