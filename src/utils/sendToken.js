const sendToken = (res, user, role, message, statusCode = 200) => {
  const token = user.getJWTToken(); // Assuming getJWTToken is a method in your User model

  const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.cookie("token", token, options);

  const formatUser = {
    _id: user._id,
    fname: user.fname,
    lname: user.lname,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.status(statusCode).json({
    success: true,
    user: formatUser,
    role,
    message,
  });
};

export default sendToken;
