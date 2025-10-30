const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    algorithm: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Algorithm',
    },
    content: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ user: 1, algorithm: 1 }, { unique: true });

module.exports = mongoose.model('Note', noteSchema);