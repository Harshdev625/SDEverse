const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["algorithm", "dataStructure"],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "contentModel",
    },
    contentModel: {
      type: String,
      required: true,
      enum: ["Algorithm", "DataStructure"],
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate bookmarks
bookmarkSchema.index({ user: 1, contentId: 1, contentType: 1 }, { unique: true });

// Additional indexes for efficient queries
bookmarkSchema.index({ user: 1, contentType: 1 });
bookmarkSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Bookmark", bookmarkSchema);