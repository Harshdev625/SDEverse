// server/models/sheet.model.js
const mongoose = require("mongoose");

const sheetQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    // order inside suite or sheet (for deterministic display)
    order: { type: Number, default: 0 },

    // optional sheet-specific overrides:
    // customHint: string shown only when rendering in this sheet
    customHint: { type: String, trim: true, default: "" },

    // optionally mark if this question is core/optional in this sheet
    isCore: { type: Boolean, default: true },
  },
  { _id: false }
);

// a suite (problem group) inside a sheet
const suiteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    order: { type: Number, default: 0 },
    description: { type: String, trim: true, default: "" },

    // list of problems in this suite
    problems: { type: [sheetQuestionSchema], default: [] },
  },
  { _id: false }
);

const sheetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "", trim: true },

    // optional owner/creator
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Suites allow grouping (e.g., "Arrays", "Greedy", etc.)
    suites: { type: [suiteSchema], default: [] },

    // computed summary fields for quick UI (can be updated when sheet changes)
    totalProblems: { type: Number, default: 0 },

    // optional visibility: public/private
    visibility: { type: String, enum: ["public", "private"], default: "public" },

    tags: [{ type: String, trim: true, index: true }],
  },
  { timestamps: true }
);

// index for quick sheet list
sheetSchema.index({ name: 1, slug: 1 });

module.exports = mongoose.model("Sheet", sheetSchema);
