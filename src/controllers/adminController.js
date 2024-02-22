import User from "../models/UserModel.js";
import sendToken from "./../utils/sendToken.js";

export const registerAdmin = async (req, res) => {
  const { fname, lname, email, password, contactNo } = req.body;

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

    user = await User.create({
      fname,
      lname,
      email,
      password,
      contactNo,
      role: 1,
    });

    sendToken(res, user, "Registerd Successfully", 201);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and Password are required.",
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
        .json({ success: false, message: "Incorrect email or password" });
    }

    if (user.role !== 1) {
      return res.status(404).json({
        success: false,
        message: "Not Authorized.",
      });
    }

    sendToken(res, user, `Welcome back ${user.fname} ${user.lname}`, 201);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutAdmin = async (req, res) => {
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

export const getLoggedInAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== 1) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
