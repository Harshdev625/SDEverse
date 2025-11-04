const mongoose = require('mongoose');

const bookmarkSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    parentType: {
      type: String,
      enum: ['Algorithm', 'DataStructure', 'Blog'],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'parentType',
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.index({ user: 1, parentType: 1, parentId: 1 }, { unique: true });

const BookmarkModel = mongoose.model('Bookmark', bookmarkSchema);
BookmarkModel.ALLOWED_PARENT_TYPES = ['Algorithm', 'DataStructure', 'Blog'];

module.exports = BookmarkModel;
