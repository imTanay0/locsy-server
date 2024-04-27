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
  const formattedCartProducts = cartProducts.map((cartProduct, i) => ({
    productId: cartProduct._id,
    productName: cartProduct.productName,
    productDescription: cartProduct.productDescription,
    price: cartProduct.price,
    stock: cartProduct.stock,
    quantity: cart.products[i].quantity,
    ProductImage: cartProduct.mainImage.image,
    category: cartProduct.category,
    sellerName: `${users[i].fname} ${users[i].lname}`,
    createdAt: cartProduct.createdAt,
    updatedAt: cartProduct.updatedAt,
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
