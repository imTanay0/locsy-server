import cloudinary from "cloudinary";

import Seller from "../models/SellerModel.js";
import User from "../models/UserModel.js";
import sendToken from "../utils/sendToken.js";
import getDataUri from "./../utils/dataUri.js";

export const registerSeller = async (req, res) => {
  const {
    fname,
    lname,
    email,
    password,
    contactNo,
    street,
    city,
    state,
    zipCode,
    shopName,
    shopDescription,
  } = req.body;

  if (
    !fname ||
    !lname ||
    !email ||
    !password ||
    !contactNo ||
    !street ||
    !city ||
    !state ||
    !zipCode
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all the required fields",
    });
  }

  if (!shopName || !shopDescription) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all the seller related information",
    });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Construct address object if address fields are provided
    const shopAddress =
      street && city && state && zipCode
        ? { street, city, state, zipCode }
        : undefined;

    // Upload file on Cloudinary
    const file = req.file;
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    // Create a new user
    user = await User.create({
      fname,
      lname,
      email,
      password,
      contactNo,
      role: 2, // Seller role
    });

    // Create a new seller linked to the user
    const seller = await Seller.create({
      userId: user._id,
      shopName,
      shopImage: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      shopDescription,
      shopAddress,
    });

    sendToken(
      res,
      user,
      seller,
      `${user.fname} ${user.lname} Registered Successfully`,
      201
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const loginSeller = async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Enter all required login fields" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect email or password" });
    }

    let role;
    if (user.role === 2) {
      role = "seller";
    } else if (user.role === 3) {
      role = "buyer";
    }

    const seller =
      role === "seller" ? await Seller.findOne({ userId: user._id }) : null;

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Seller not found",
      });
    }

    sendToken(
      res,
      user,
      seller,
      `Welcome back ${user.fname} ${user.lname}`,
      201
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutSeller = async (req, res) => {
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

export const getSeller = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== 2) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const seller = await Seller.findOne({ userId: user._id });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
      seller,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// TODO ------------>

// export const getSellerById = async (req, res) => {}

// export const updateSeller = async (req, res) => {}

// export const deleteSeller = async (req, res) => {}

// export const getAllSellers = async (req, res) => {}

// export const getSellerProducts = async (req, res) => {}

// export const getSellerOrders = async (req, res) => {}

// export const getSellerSales = async (req, res) => {}
