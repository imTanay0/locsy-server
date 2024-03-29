import Product from "../models/ProductModel.js";
import Seller from "../models/SellerModel.js";
import Buyer from "../models/BuyerModel.js";
import User from "../models/UserModel.js";

export const createCart = async (req, res) => {
  const {products, } = req.body;
  
  try {
    res.status(200).json({
      success: true,
      message: "Hey Cart Controller",
      user: req.user,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}