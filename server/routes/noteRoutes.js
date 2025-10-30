const express = require('express');
const router = express.Router();
const { getNote, setNote, deleteNote, getAllMyNotes } = require('../controllers/noteController');
const { protect } = require('../middleware/auth.middleware');

router.route('/my').get(protect, getAllMyNotes); 
router.route('/').post(protect, setNote); 
router.route('/:algorithmId')
  .get(protect, getNote)     
  .delete(protect, deleteNote); 

module.exports = router;