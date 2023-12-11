export const getUsersForSellers = async (sellers, User) => {
  try {
    const userPromises = sellers.map(async (seller) => {
      const user = await User.findById(seller.userId);
      return user;
    });

    // Wait for all promises to resolve using Promise.all
    const users = await Promise.all(userPromises);

    return users;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
