import Seller from "../models/SellerModel.js";
import User from "../models/UserModel.js";
import sendToken from "../utils/sendToken.js";
import getDataUri from './../utils/dataUri.js';

export const registerSeller = async (req, res) => {
  const {
    fname,
    lname,
    email,
    password,
    contactNo,
    address,
    shopName,
    shopImage,
    shopDescription,
  } = req.body;

  if (!fname || !lname || !email || !password || !contactNo) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the fields",
    });
  }

  if (!shopName || !shopDescription) {
    return res.status(400).json({
      success: false,
      message: "Please fill all the related to seller information",
    });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

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
      address,
      role: 2, // Seller role
    });

    // Create a new seller linked to the user
    const seller = await Seller.create({
      userId: user._id,
      shopName,
      shopImage,
      shopDescription,
    });

    sendToken(res, user, seller, "Registerd Successfully", 201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginSeller = async (req, res) => {
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

    sendToken(res, user, seller, `Welcome back ${user.fname}`, 201);
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
