const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sheet: { type: mongoose.Schema.Types.ObjectId, ref: "Sheet", required: true },
    solvedCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

userProgressSchema.index({ user: 1, sheet: 1 }, { unique: true });

module.exports = mongoose.model("UserProgress", userProgressSchema);
