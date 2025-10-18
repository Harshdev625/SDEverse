const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  // Password is required for local users, but optional when using Google auth
  password: { type: String, required: function () { return !this.googleId; } },
    bio: { type: String, trim: true, default: "" },

    fullName: { type: String, trim: true, default: "" },
    avatarUrl: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },

    competitiveProfiles: {
      leetcode: { type: String, trim: true, default: "" },
      codeforces: { type: String, trim: true, default: "" },
      codechef: { type: String, trim: true, default: "" },
      atcoder: { type: String, trim: true, default: "" },
      spoj: { type: String, trim: true, default: "" },
    },

    competitiveStats: {
      codeforces: {
        currentRating: { type: Number, default: 0 },
        maxRating: { type: Number, default: 0 },
        rank: { type: String, default: "" },
        totalSolved: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      leetcode: {
        totalSolved: { type: Number, default: 0 },
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
        ranking: { type: Number, default: 0 },
        contestRating: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      codechef: {
        currentRating: { type: Number, default: 0 },
        maxRating: { type: Number, default: 0 },
        stars: { type: Number, default: 0 },
        globalRank: { type: Number, default: 0 },
        countryRank: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      atcoder: {
        rating: { type: Number, default: 0 },
        rank: { type: String, default: "" },
        performance: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      spoj: {
        totalSolved: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
    },

    socialLinks: {
      github: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      facebook: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
    },

    socialStats: {
      github: {
        publicRepos: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
        totalStars: { type: Number, default: 0 },
        totalForks: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      linkedin: {
        connections: { type: Number, default: 0 },
        profileViews: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      twitter: {
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
        tweets: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      facebook: {
        friendsCount: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      instagram: {
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
        posts: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
    },

    totalProposals: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // OAuth fields
    googleId: { type: String, index: true, default: null },
    provider: { type: String, enum: ["local", "google"], default: "local" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
