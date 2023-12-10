import Buyer from "../models/BuyerModel.js";
import User from "../models/UserModel.js";
import sendToken from "./../utils/sendToken.js";

export const registerBuyer = async (req, res) => {
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

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Construct address object if address fields are provided
    const address =
      street && city && state && zipCode
        ? { street, city, state, zipCode }
        : undefined;

    // Create a new user
    user = await User.create({
      fname,
      lname,
      email,
      password,
      contactNo,
      address,
      role: 3, // Buyer role
    });

    const buyer = await Buyer.create({ userId: user._id });

    sendToken(
      res,
      user,
      buyer,
      `${user.fname} ${user.lname} Registered Successfully`,
      201
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginBuyer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all the required fields",
    });
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
        .json({ success: false, message: "Invalid email or password" });
    }

    let role;
    if (user.role === 2) {
      role = "seller";
    } else if (user.role === 3) {
      role = "buyer";
    }

    const buyer =
      role === "buyer" ? await Buyer.findOne({ userId: user._id }) : null;

    if (!buyer) {
      return res.status(401).json({
        success: false,
        message: "Buyer not found",
      });
    }

    sendToken(
      res,
      user,
      buyer,
      `Welcome back ${user.fname} ${user.lname}`,
      200
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutBuyer = async (req, res) => {
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
