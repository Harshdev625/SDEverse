// In server/routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const { getNote, setNote } = require('../controllers/noteController');

// Import your authentication middleware
// We know from your project structure this is the correct path
const { protect } = require('../middleware/auth.middleware');

// @route   POST /api/notes
// This will run the setNote function when a POST request is made to /api/notes
router.route('/').post(protect, setNote);

// @route   GET /api/notes/:algorithmId
// This will run the getNote function when a GET request is made to /api/notes/some-id
router.route('/:algorithmId').get(protect, getNote);

module.exports = router;