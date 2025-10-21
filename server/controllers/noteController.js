// In server/controllers/noteController.js
const Note = require('../models/noteModel');

// @desc    Get a user's note for a specific algorithm
// @route   GET /api/notes/:algorithmId
// @access  Private
const getNote = async (req, res) => {
  try {
    // Find a note that matches the logged-in user and the algorithm ID
    const note = await Note.findOne({
      user: req.user.id, // This 'req.user.id' comes from your auth middleware
      algorithm: req.params.algorithmId,
    });

    if (note) {
      // If we find a note, send it
      res.json(note);
    } else {
      // If no note exists, send back an "empty" note object.
      // This makes the frontend logic easier.
      res.json({
        user: req.user.id,
        algorithm: req.params.algorithmId,
        content: '',
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create or update a note
// @route   POST /api/notes
// @access  Private
const setNote = async (req, res) => {
  const { algorithmId, content } = req.body;

  if (!algorithmId) {
    res.status(400);
    throw new Error('Algorithm ID is required');
  }

  try {
    // This one command finds a note and updates it.
    // If it doesn't find a note, 'upsert: true' tells it to create one.
    const note = await Note.findOneAndUpdate(
      {
        user: req.user.id,
        algorithm: algorithmId,
      },
      {
        content: content,
      },
      {
        new: true, // Return the new, updated document
        upsert: true, // Create the document if it doesn't exist
      }
    );

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getNote,
  setNote,
};