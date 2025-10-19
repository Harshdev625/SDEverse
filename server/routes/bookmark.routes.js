const express = require("express");
const router = express.Router();
const {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmark,
} = require("../controllers/bookmark.controller");
const { protect } = require("../middleware/auth.middleware");

// All bookmark routes require authentication
router.use(protect);

router.route("/")
  .get(getUserBookmarks)
  .post(addBookmark);

router.route("/check/:contentId")
  .get(checkBookmark);

router.route("/:contentId")
  .delete(removeBookmark);

module.exports = router;