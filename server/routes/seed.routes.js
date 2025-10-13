const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth.middleware");
const { seedReferenceSheets } = require("../controllers/seed.controller");

router.post("/sheets/reference", protect, admin, seedReferenceSheets);

module.exports = router;
