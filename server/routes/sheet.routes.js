const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth.middleware");
const {
  createSheet,
  listSheets,
  getSheetBySlug,
  updateSheet,
  deleteSheet,
} = require("../controllers/sheet.controller");

// Public
router.get("/", listSheets);
router.get("/:slug", getSheetBySlug);

// Admin
router.post("/", protect, admin, createSheet);
router.put("/:id", protect, admin, updateSheet);
router.delete("/:id", protect, admin, deleteSheet);

module.exports = router;
