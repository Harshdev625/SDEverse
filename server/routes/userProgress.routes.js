const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const {
  userProgress,
  userProgressSheetwise,
} = require("../controllers/userProgress.controller");

//user progress
//get user progress
router.get("/", protect, userProgress);

//get progress sheet wise
router.get("/:sheetId", protect, userProgressSheetwise);

module.exports = router;
