const express = require("express");
const router = express.Router();
const {
  getNote,
  setNote,
  deleteNote,
  getAllMyNotes,
} = require("../controllers/note.controller");
const { protect } = require("../middleware/auth.middleware");

router.route("/my").get(protect, getAllMyNotes);
router.route("/").post(protect, setNote);

router
  .route("/parent/:parentType/:parentId")
  .get(protect, getNote)
  .delete(protect, deleteNote);

module.exports = router;