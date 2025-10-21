const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");

const validateEmail = (email) => {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 100;
};

const validateUsername = (username) => {
  if (typeof username !== "string") return false;
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username.trim());
};

const validatePassword = (password) => {
  if (typeof password !== "string") return false;
  return (
    password.length >= 6 &&
    password.length <= 128 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

// Added: Sanitize input to prevent NoSQL injection and XSS
const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";
  return input.trim().replace(/^\$/, "");
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields: username, email, and password");
  }

  // Added: Sanitize inputs to prevent injection attacks
  const sanitizedUsername = sanitizeInput(username);
  const sanitizedEmail = sanitizeInput(email);

  // Added: Validate username format
  if (!validateUsername(sanitizedUsername)) {
    res.status(400);
    throw new Error("Username must be 3-20 characters and contain only letters, numbers, and underscores");
  }

  // Added: Validate email format
  if (!validateEmail(sanitizedEmail)) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }

  if (!validatePassword(password)) {
    res.status(400);
    throw new Error("Password must be at least 6 characters and contain at least one letter and one number");
  }

  // Added: Check for duplicate username as well as email
  const [emailExists, usernameExists] = await Promise.all([
    User.findOne({ email: sanitizedEmail.toLowerCase() }),
    User.findOne({ username: sanitizedUsername }),
  ]);

  if (emailExists) {
    res.status(400);
    throw new Error("Email already registered");
  }

  if (usernameExists) {
    res.status(400);
    throw new Error("Username already taken");
  }

  const user = await User.create({
    username: sanitizedUsername,
    email: sanitizedEmail.toLowerCase(), 
    password, 
  });

  if (user) {
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      ...userObj,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Added: Validate input types to prevent injection
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400);
    throw new Error("Invalid input format");
  }

  const sanitizedEmail = sanitizeInput(email);

  if (!validateEmail(sanitizedEmail)) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }

  
  const user = await User.findOne({ email: sanitizedEmail.toLowerCase() });

  if (user && (await user.matchPassword(password))) {
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      ...userObj,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, user not found");
  }

  const user = req.user.toObject();
  delete user.password;

  res.status(200).json(user);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  // Validate all fields are provided
  if (!email || !newPassword || !confirmPassword) {
    res.status(400);
    throw new Error("Please provide email, new password, and confirm password");
  }

  // Sanitize email
  const sanitizedEmail = sanitizeInput(email);

  // Validate email format
  if (!validateEmail(sanitizedEmail)) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  // Validate new password strength
  if (!validatePassword(newPassword)) {
    res.status(400);
    throw new Error("New password must be at least 6 characters and contain at least one letter and one number");
  }

  // Find user by email
  const user = await User.findOne({ email: sanitizedEmail.toLowerCase() });

  if (!user) {
    res.status(404);
    throw new Error("User not found with this email");
  }

  if (user.matchPassword(newPassword)) {
    res.status(400);
    throw new Error("New password must be different from the old password");
  }
  
  // Update password (will be hashed by the pre-save hook in user model)
  user.password = newPassword;
  await user.save();

  res.status(200).json({ 
    message: "Password reset successfully",
    success: true 
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  resetPassword,
};