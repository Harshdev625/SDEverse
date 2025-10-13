const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth.middleware");
const {
  submitSheetProposal,
  listSheetProposals,
  listMySheetProposals,
  approveSheetProposal,
  rejectSheetProposal,
} = require("../controllers/sheetProposal.controller");

// Auth user submits a proposal for a given sheet
router.post("/:sheetId/proposals", protect, submitSheetProposal);

// Admin lists proposals for a given sheet
router.get("/:sheetId/proposals", protect, admin, listSheetProposals);

// Auth user lists own proposals (across sheets)
router.get("/me/proposals", protect, listMySheetProposals);

// Admin reviews proposals
router.put("/proposals/:id/approve", protect, admin, approveSheetProposal);
router.put("/proposals/:id/reject", protect, admin, rejectSheetProposal);

module.exports = router;
