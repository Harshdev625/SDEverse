// In server/models/noteModel.js
const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
  {
    // This links the note to a specific user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // This links the note to a specific algorithm
    algorithm: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Algorithm', 
    },
    // This is the actual text of the note
    content: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// This index is a smart way to ensure a user can only have
// ONE note per algorithm. It prevents duplicate notes.
noteSchema.index({ user: 1, algorithm: 1 }, { unique: true });

module.exports = mongoose.model('Note', noteSchema);