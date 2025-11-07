const mongoose = require('mongoose');

const LinkItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, required: true },
    platform: { type: String, trim: true, default: 'web' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LinkGroupSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    privacy: { type: String, enum: ['private', 'public', 'unlisted'], default: 'private' },
    links: { type: [LinkItemSchema], default: [] },
      // users this group has been explicitly shared with
      sharedWith: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  {
    timestamps: true,
  }
);

// ensure a user cannot have two groups with the same slug
LinkGroupSchema.index({ user: 1, slug: 1 }, { unique: true });

const LinkGroup = mongoose.model('LinkGroup', LinkGroupSchema);

module.exports = LinkGroup;
