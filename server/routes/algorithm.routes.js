const express = require("express");
const router = express.Router();

const {
  createAlgorithm,
  getAllAlgorithms,
  getAlgorithmsForList,
  getAlgorithmBySlug,
  updateAlgorithm,
  deleteAlgorithm,
  voteAlgorithm,
  getAllCategories,
  searchAlgorithms,
  addAlgorithmCode,
  getContributors,
} = require("../controllers/algorithm.controller");

const { protect, admin } = require("../middleware/auth.middleware");
const validateAlgorithm = require("../middleware/validateAlgorithm");

router.get("/", getAllAlgorithms);
router.get("/list", getAlgorithmsForList); 
router.get("/categories", getAllCategories);
router.get("/search", searchAlgorithms);
router.get("/:slug", getAlgorithmBySlug);

router.post("/", protect, validateAlgorithm, createAlgorithm);
router.put("/:slug", protect, validateAlgorithm, updateAlgorithm);
router.delete("/:slug", protect, admin, deleteAlgorithm);
router.post("/:slug/code", protect, addAlgorithmCode);
router.get("/:slug/contributors", getContributors);

router.post("/:slug/vote", protect, voteAlgorithm);

module.exports = router;
