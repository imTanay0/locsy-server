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
    success_url: `${FRONTEND_URL}/ordrer-status?success=true`,
    cancel_url: `${FRONTEND_URL}/cart?canceled=true`,
  });

  return sessionData;
};

export const getProductsForOrders = async (orders, Product) => {
  try {
    const orderedProducts = orders.map((order) => order.orderedProducts);

    const orderedProductsFlat = orderedProducts.flat();

    const productPromises = orderedProductsFlat.map(
      async (product) =>
        await Product.findById(product.productId).populate("sellerId")
    );

    // Wait for all promises to resolve using Promise.all
    const products = await Promise.all(productPromises);

    return products;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const formatOrder = (orders, products) => {
  const formatProducts = products.map((product) => ({
    productId: product._id,
    productName: product.productName,
    productImg: product.mainImage.image.url,
    price: product.price,
    stock: product.stock,
    sellerId: product.sellerId._id,
  }));

  const data = orders.map((order, idx) => ({
    orderId: order._id,
    address: order.address,
    buyerId: order.buyerId,
    totalPrice: order.totalPrice,
    orderStatus: order.orderStatus,
    products: formatProducts,
  }));

  return data;
};
