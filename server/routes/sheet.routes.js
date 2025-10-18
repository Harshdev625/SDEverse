const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/auth.middleware");
const validateBody = require("../validators/validate");
const sheetSchema = require("../validators/sheetValidator");
const {
  getSheet,
  getAllSheets,
  createSheet,
  updateSheet,
  deleteSheet,
  getAdminSheetMetrics
} = require("../controllers/sheet.controller");

//get all sheets
router.get("/", protect, getAllSheets);
//creat sheet
router.post("/", protect, admin, validateBody(sheetSchema), createSheet);

router.get("/metrics", protect, admin, getAdminSheetMetrics);

//get single sheet

router.get("/:id", protect, getSheet);

//update sheet
router.put("/:id", protect, admin, validateBody(sheetSchema), updateSheet);

//delete sheet
router.delete("/:id", protect, admin, deleteSheet);

module.exports = router;
