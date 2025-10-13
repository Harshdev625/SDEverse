const mongoose = require("mongoose");

const sheetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Mixed"],
      default: "Mixed",
      index: true,
    },
    platform: {
      type: String,
      enum: ["StriverA2Z", "NeetCode150", "Other"],
      default: "Other",
      index: true,
    },
    tags: [{ type: String, trim: true }],

    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

sheetSchema.index({ platform: 1, difficulty: 1 });

module.exports = mongoose.model("Sheet", sheetSchema);
