import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Seller from "../models/SellerModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const isSeller = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);

    if (req.user.role !== 2) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.seller = await Seller.findById(req.user._id);

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
