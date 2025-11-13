const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true },
    tags: [{ type: String, trim: true, index: true }],
    category: {
      type: String,
      enum: ["Tutorial", "Interview Experience", "Tips & Tricks", "Discussion", "News", "Other"],
      default: "Discussion",
      index: true,
    },
    featuredImage: { type: String, trim: true },

    // Author and ownership
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Engagement metrics
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },

    // Publication state
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Admin review (optional, for moderated blogs)
    needsReview: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewComment: { type: String },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes
blogSchema.index({
  title: "text",
  content: "text",
  excerpt: "text",
  tags: "text",
});
blogSchema.index({ category: 1, status: 1, isPublished: 1 });
blogSchema.index({ author: 1, status: 1 });

// Pre-save middleware to generate excerpt if not provided
blogSchema.pre("save", function (next) {
  if (!this.excerpt && this.content) {
    // Generate excerpt from content (first 200 characters)
    this.excerpt = this.content.replace(/<[^>]*>/g, "").substring(0, 200) + "...";
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);