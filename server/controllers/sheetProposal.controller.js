const SheetProposal = require("../models/sheetProposal.model");

const getAllProposals = async (req, res) => {
  try {
    const proposals = await SheetProposal.find()
      .populate("userId", "username email")
      .populate("sheetId", "title");
    if (!proposals) {
      return res.status(404).json({ message: "No proposals found" });
    }
    res.status(200).json(proposals);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const createProposal = async (req, res) => {
  try {
    const proposal = await SheetProposal.create({
      userId: req.user._id,
      sheetId: req.body.sheetId,
      proposedChanges: req.body.proposedChanges,
      status: "Pending",
    });
    res.status(201).json(proposal);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

const viewProposals = async (req, res) => {
  try {
    const proposals = await SheetProposal.find({
      userId: req.user._id,
    }).populate("sheetId", "title");
    if (!proposals || proposals.length === 0) {
      return res.status(404).json({ message: "Proposals not found" });
    }
    res.status(200).json(proposals);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const updateProposal = async (req, res) => {
  try {
    const proposal = await SheetProposal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    res.status(200).json(proposal);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

module.exports = {
  getAllProposals,
  createProposal,
  viewProposals,
  updateProposal,
};
