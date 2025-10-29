// server/models/userProblemProgress.model.js
const mongoose = require("mongoose");

/**
 * A document per user+problem+(optional sheet)
 * This makes updates (mark complete, add notes, unlock hint) O(1) with an indexed query.
 */
const userProblemProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // which question/problem this progress refers to
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true, index: true },

    // optional: which sheet (some problems may be present in multiple sheets; progress is per sheet)
    sheetId: { type: mongoose.Schema.Types.ObjectId, ref: "Sheet", default: null, index: true },

    // boolean solved/completed
    solved: { type: Boolean, default: false, index: true },

    // free-form notes the user may add
    notes: { type: String, default: "" },

    // unlocked hint indices (store indexes of hints array that user has unlocked) 
    // e.g., [0] or [0,1]
    unlockedHints: { type: [Number], default: [] },

    // whether the solution has been unlocked by this user for this problem (per sheet)
    unlockedSolution: { type: Boolean, default: false },

    // optional rating, attempt count etc. can be extended later
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Uniqueness: one document per (userId, problemId, sheetId)
// sheetId can be null: if sheetId is null, progress is considered global for that problem
userProblemProgressSchema.index({ userId: 1, problemId: 1, sheetId: 1 }, { unique: true });

module.exports = mongoose.model("UserProblemProgress", userProblemProgressSchema);
