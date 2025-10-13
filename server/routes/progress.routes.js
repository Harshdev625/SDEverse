const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { getMyProgress, incrementSolved, setSolvedCount } = require("../controllers/progress.controller");

router.get("/sheets/:sheetId/my", protect, getMyProgress);
router.post("/sheets/:sheetId/increment", protect, incrementSolved);
router.put("/sheets/:sheetId", protect, setSolvedCount);

module.exports = router;
