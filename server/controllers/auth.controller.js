const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const { verifyGoogleIdToken } = require("../utils/google");

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    username,
    email,
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

  const user = await User.findOne({ email });

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
  const user = req.user.toObject();
  delete user.password;

  res.status(200).json(user);
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  googleAuth: asyncHandler(async (req, res) => {
    const { credential } = req.body; // Google ID token
    if (!credential) {
      res.status(400);
      throw new Error("Missing Google credential");
    }

    console.log('[Google Auth] Received credential, verifying...');
    const payload = await verifyGoogleIdToken(credential);
    console.log('[Google Auth] Payload received:', { email: payload.email, name: payload.name });
    const { email, name, picture, sub: googleId, email_verified } = payload;

    if (!email_verified) {
      res.status(400);
      throw new Error("Email not verified by Google");
    }

    // Try to find by googleId first, then by email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Derive a username: prefer part before @, ensure uniqueness
      const baseUsername = (email?.split('@')[0] || name || 'user').replace(/[^a-zA-Z0-9_\.\-]/g, '').slice(0, 20) || `user${Date.now()}`;
      let candidate = baseUsername;
      let suffix = 0;
      while (await User.findOne({ username: candidate })) {
        suffix += 1;
        candidate = `${baseUsername}${suffix}`.slice(0, 24);
      }

      user = await User.create({
        username: candidate,
        email,
        googleId,
        provider: 'google',
        avatarUrl: picture || '',
        // no password for google accounts
      });
    } else {
      // Link googleId if missing
      let changed = false;
      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
        changed = true;
      }
      if (user.provider !== 'google') {
        // keep provider as local if you want dual; else set to google
        user.provider = user.provider || 'google';
      }
      if (changed) await user.save();
    }

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      ...userObj,
      token,
    });
  }),
};
