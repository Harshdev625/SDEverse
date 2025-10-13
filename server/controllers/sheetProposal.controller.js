const asyncHandler = require("express-async-handler");
const Sheet = require("../models/sheet.model");
const SheetProposal = require("../models/sheetProposal.model");

// Submit a proposal for a sheet (Auth)
const submitSheetProposal = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;
  const { changes, notes } = req.body;

  if (!changes || typeof changes !== "object") {
    res.status(400);
    throw new Error("'changes' object is required");
  }

  const sheet = await Sheet.findById(sheetId);
  if (!sheet) {
    res.status(404);
    throw new Error("Sheet not found");
  }

  const proposal = await SheetProposal.create({
    sheet: sheet._id,
    proposedBy: req.user._id,
    changes,
    notes: notes || "",
  });

  res.status(201).json(proposal);
});

// List proposals for a sheet (Admin)
const listSheetProposals = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;
  const proposals = await SheetProposal.find({ sheet: sheetId })
    .populate("proposedBy", "username email")
    .sort({ createdAt: -1 });
  res.json(proposals);
});

// List my proposals (Auth)
const listMySheetProposals = asyncHandler(async (req, res) => {
  const proposals = await SheetProposal.find({ proposedBy: req.user._id })
    .populate("sheet", "title slug")
    .sort({ createdAt: -1 });
  res.json(proposals);
});

// Approve a proposal (Admin) - apply changes to the Sheet
const approveSheetProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const proposal = await SheetProposal.findById(id);
  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }
  if (proposal.status !== "pending") {
    res.status(400);
    throw new Error("Only pending proposals can be approved");
  }

  const sheet = await Sheet.findById(proposal.sheet);
  if (!sheet) {
    res.status(404);
    throw new Error("Target sheet not found");
  }

  const allowed = ["title", "description", "difficulty", "platform", "tags", "isPublished"];
  for (const key of allowed) {
    if (proposal.changes[key] !== undefined) {
      sheet[key] = proposal.changes[key];
    }
  }
  sheet.updatedBy = req.user._id;
  await sheet.save();

  proposal.status = "approved";
  proposal.reviewedBy = req.user._id;
  proposal.reviewedAt = new Date();
  await proposal.save();

  res.json({ message: "Proposal approved and applied", sheet, proposal });
});

// Reject a proposal (Admin)
const rejectSheetProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  const proposal = await SheetProposal.findById(id);
  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }
  if (proposal.status !== "pending") {
    res.status(400);
    throw new Error("Only pending proposals can be rejected");
  }

  proposal.status = "rejected";
  proposal.reviewedBy = req.user._id;
  proposal.reviewedAt = new Date();
  if (notes) proposal.notes = notes;
  await proposal.save();

  res.json({ message: "Proposal rejected", proposal });
});

module.exports = {
  submitSheetProposal,
  listSheetProposals,
  listMySheetProposals,
  approveSheetProposal,
  rejectSheetProposal,
};
