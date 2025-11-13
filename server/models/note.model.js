const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    parentType: {
      type: String,
      enum: ['Algorithm', 'DataStructure'],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'parentType',
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

// This is the correct index that will be created after you drop the old one
noteSchema.index({ user: 1, parentType: 1, parentId: 1 }, { unique: true });
const NoteModel = mongoose.model('Note', noteSchema);
NoteModel.ALLOWED_PARENT_TYPES = ['Algorithm', 'DataStructure'];

module.exports = NoteModel;