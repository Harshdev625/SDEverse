const crypto = require("crypto");

const users = [
  { id: 1, email: "test@example.com", password: "oldpassword123" },
];

const resetTokens = {}; // { token: email }

const forgotPassword = (req, res) => {
  const { email } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(404).json({ message: "User not found with this email." });
  }
  // Generate reset token
  const token = crypto.randomBytes(20).toString("hex");
  resetTokens[token] = email;
  // Simulated reset link
  const resetLink = `http://localhost:5173/reset-password/${token}`;

  res.status(200).json({
    message: "Password reset link generated successfully.",
    resetLink,
  });
};
// Reset Password
const resetPassword = (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!resetTokens[token]) {
    return res.status(400).json({ message: "Invalid or expired token." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  const email = resetTokens[token];
  const user = users.find((u) => u.email === email);

  user.password = password;
  delete resetTokens[token]; // Token invalidated

  res.status(200).json({ message: "Password reset successfully!" });
};

module.exports = { forgotPassword, resetPassword };
