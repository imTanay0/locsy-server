// import crypto from "crypto-js";

import User from "../models/UserModel.js";
import Seller from "../models/SellerModel.js";
import Buyer from "../models/BuyerModel.js";
import sendToken from "./../utils/sendToken.js";

export const register = async (req, res) => {
  const { fname, lname, email, password, contactNo, address } = req.body;

  if (!fname || !lname || !email || !password || !contactNo) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // TODO -> Upload file on Cloudinary
    // const file = req.file;
    // const fileUri = getDataUri(file);
    // const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
      fname,
      lname,
      email,
      password,
      contactNo,
      address,
      // profileImg: {
      //   public_id: mycloud.public_id,
      //   url: mycloud.secure_url,
      // },
    });

    sendToken(res, user, "Registerd Successfully", 201);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Enter all fields" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect email or password" });
    }

    sendToken(res, user, `Welcome back ${user.name}`, 201);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// fix the code
export const logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
      })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let role;

    if (user.role === 1) {
      return res.status(200).json({ success: true, user });
    }

    if (user.role === 2) {
      const seller = await Seller.findOne({ userId: user._id });
      return res.status(200).json({ success: true, user, role: seller });
    }

    if (user.role === 3) {
      const buyer = await Buyer.findOne({ userId: user._id });
      return res.status(200).json({ success: true, user, role: buyer });
    }

    res.status(401).json({ success: false, message: "Unauthorized" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
