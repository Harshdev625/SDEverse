const mongoose = require("mongoose");

const BLOG_CATEGORIES = ["StudyResources", "InterviewExperiences"]; // high level
const STUDY_SUBCATEGORIES = ["DSA", "SystemDesign", "CSFundamentals", "Other"];

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },

    // Top-level category
    category: { type: String, enum: BLOG_CATEGORIES, required: true, index: true },

    // For StudyResources
    studySubtype: { type: String, enum: STUDY_SUBCATEGORIES },

    // For InterviewExperiences
    company: { type: String, trim: true, index: true },
    role: { type: String, trim: true },

    tags: [{ type: String, trim: true, index: true }],

    // Moderation
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },

    // Authorship
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Engagement
    likesCount: { type: Number, default: 0, index: true },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

blogSchema.index({ category: 1, studySubtype: 1 });
blogSchema.index({ company: 1, createdAt: -1 });

module.exports = mongoose.model("Blog", blogSchema);
