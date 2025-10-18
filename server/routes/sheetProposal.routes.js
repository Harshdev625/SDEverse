const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/auth.middleware");
const validateBody = require("../validators/validate");
const proposalSchema = require("../validators/proposalValidator");
const {
  getAllProposals,
  createProposal,
  viewProposals,
  updateProposal,
} = require("../controllers/sheetProposal.controller");

//get all proposal
router.get("/", protect, admin, getAllProposals);
//creating proposal
router.post("/", protect, validateBody(proposalSchema), createProposal);

//view proposals
router.get("/my", protect, viewProposals);

//update proposal
router.put(
  "/:id",
  protect,
  admin,
  validateBody(proposalSchema),
  updateProposal
);

module.exports = router;
