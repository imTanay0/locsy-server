export const getSellersForProducts = async (products, Seller) => {
  try {
    const sellerPromises = products.map(async (product) => {
      const seller = await Seller.findById(product.sellerId);
      return seller;
    });

    // Wait for all promises to resolve using Promise.all
    const sellers = await Promise.all(sellerPromises);

    return sellers;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// export const getCategoriesForProducts = async (products, Category) => {
//   try {
//     const categoriesPromises = products.map(async (product) => {
//       const categories = await Category.find({
//         _id: { $in: product.categories },
//       });

//       return {
//         productId: product._id,
//         categories: categories,
//       };
//     });

//     const categories = await Promise.all(categoriesPromises);

//     return categories;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };


export const getCategoriesForProducts = async (products, Category) => {
  try {
    const categoryPromises = products.map(async (product) => {
      const categories = await Category.find({
        _id: { $in: product.categories },
      });

      return categories;
    });

    const categories = await Promise.all(categoryPromises);

    return categories;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
