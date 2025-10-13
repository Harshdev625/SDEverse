const mongoose = require("mongoose");

const sheetProposalSchema = new mongoose.Schema(
  {
    sheet: { type: mongoose.Schema.Types.ObjectId, ref: "Sheet", required: true },
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    changes: { type: Object, required: true }, // partial fields to apply to Sheet
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

sheetProposalSchema.index({ sheet: 1, status: 1 });

module.exports = mongoose.model("SheetProposal", sheetProposalSchema);
