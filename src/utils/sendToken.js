const sendToken = (res, user, role, message, statusCode = 200) => {
  const token = user.getJWTToken(); // Assuming getJWTToken is a method in your User model

  const options = {
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure attribute in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax", // Adjust based on environment
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
    role,
  });
};

export default sendToken;
