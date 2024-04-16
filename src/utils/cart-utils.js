export const getProductsForCartItems = async (cart, Product) => {
  try {
    const productPromises = cart.products.map(
      async (product) => await Product.findById(product.productId)
    );

    // Wait for all promises to resolve using Promise.all
    const cartProducts = await Promise.all(productPromises);

    return cartProducts;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const returnFormattedCart = (cart, cartProducts, users) => {
  const formattedCartProducts = cartProducts.map((cartProducts, i) => ({
    productId: cartProducts._id,
    productName: cartProducts.productName,
    productDescription: cartProducts.productDescription,
    price: cartProducts.price,
    stock: cartProducts.stock,
    quantity: cart.products[i].quantity,
    ProductImage: cartProducts.mainImage.image,
    category: cartProducts.category,
    sellerName: `${users[i].fname} ${users[i].lname}`,
    createdAt: cartProducts.createdAt,
    updatedAt: cartProducts.updatedAt,
  }));

  const formattedCart = {
    _id: cart._id,
    buyerId: cart.buyerId,
    products: formattedCartProducts,
    totalPrice: cart.totalPrice,
    totalItems: cart.totalItems,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };

  return formattedCart;
};
