const express = require("express");
const router = express.Router();

const {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmark,
} = require("../controllers/bookmark.controller");

const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getUserBookmarks);
router.post("/", protect, addBookmark);
router.get("/check/:contentId", protect, checkBookmark);
router.delete("/:contentId", protect, removeBookmark);

module.exports = router;