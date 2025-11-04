const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getBookmark,
  setBookmark,
  deleteBookmark,
  getAllMyBookmarks,
} = require('../controllers/bookmark.controller');

router.get('/parent/:parentType/:parentId', protect, getBookmark);
router.post('/', protect, setBookmark);
router.delete('/parent/:parentType/:parentId', protect, deleteBookmark);
router.get('/my', protect, getAllMyBookmarks);

module.exports = router;
