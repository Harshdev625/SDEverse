// server/models/question.model.js
const mongoose = require("mongoose");

// hint subdocument
const hintSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ["basic", "intermediate", "advanced"],
      default: "basic",
    },
    type: {
      type: String,
      enum: ["conceptual", "implementation", "edge-case", "optimization", "other"],
      default: "other",
    },
  },
  { _id: false }
);

// code solution subdocument
const codeSchema = new mongoose.Schema(
  {
    language: { type: String, required: true, trim: true },
    code: { type: String, required: true },
  },
  { _id: false }
);

// main question schema
const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, trim: true, index: true }, 
    problemUrl: { type: String, trim: true },

    platform: {
      type: String,
      enum: ["leetcode", "codeforces", "gfg", "codechef", "atcoder", "spoj", "other"],
      default: "other",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "easy", "medium", "hard"],
      default: "Medium",
      index: true,
    },

    tags: [{ type: String, trim: true, index: true }],
    description: { type: String, default: "", trim: true },

    // multiple leveled hints
    hints: { type: [hintSchema], default: [] },

    // multiple code solutions (language + code)
    solutions: { type: [codeSchema], default: [] },

    // multiple video solution links (lightweight)
    videoSolutions: { type: [String], default: [] },

    // optional short solution url (if you still want external link)
    solutionUrl: { type: String, trim: true, default: "" },

    explanation: { type: String, default: "", trim: true },

    // contribution metadata (optional)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// text index for searching
questionSchema.index({
  title: "text",
  description: "text",
  explanation: "text",
  "hints.text": "text",
  tags: "text",
});

module.exports = mongoose.model("Question", questionSchema);
