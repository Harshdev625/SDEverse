// controllers/passwordReset.controller.js
const asyncHandler = require("express-async-handler");

// 🆕 Temporary forgot password controller
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  // Temporary: accept any email for testing
  res.status(200).json({
    message: `Password reset link sent to ${email}`,
    token: "123456abcdef", // fake token for testing
  });
});

// 🆕 Temporary reset password controller
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!password) {
    res.status(400);
    throw new Error("Password is required");
  }

  // Temporary: just respond successfully without DB
  res.status(200).json({
    message: `Password has been reset successfully for token: ${token}`,
  });
});

module.exports = {
  forgotPassword,
  resetPassword,
};
