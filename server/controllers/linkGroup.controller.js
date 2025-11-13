const LinkGroup = require('../models/linkGroup.model');
const slugify = require('slugify');
const User = require('../models/user.model');

async function generateUniqueSlugForUser(userId, title) {
  const base = slugify(title || 'group', { lower: true, strict: true }) || 'group';
  let slug = base;
  let counter = 1;
  // keep trying until it's unique for this user
  while (await LinkGroup.findOne({ user: userId, slug })) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

const createGroup = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'User not authenticated' });
    const { name, description, privacy } = req.body;
    if (!name || !name.toString().trim()) return res.status(400).json({ message: 'Group name is required' });

    const slug = await generateUniqueSlugForUser(req.user.id, name);

    const created = await LinkGroup.create({
      user: req.user.id,
      name: name.toString().trim(),
      slug,
      description: description || '',
      privacy: privacy || 'private',
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error('Error creating link group:', error);
    if (error && error.code === 11000) return res.status(409).json({ message: 'Group slug conflict' });
    return res.status(500).json({ message: 'Server Error creating group' });
  }
};

const getMyGroups = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'User not authenticated' });
    const q = (req.query.q || '').toString().trim();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (q) filter.name = { $regex: q, $options: 'i' };

    const total = await LinkGroup.countDocuments(filter);
    const groups = await LinkGroup.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    res.json({ groups, total, pages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Server Error fetching groups' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const id = req.params.id;
    const group = await LinkGroup.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Access rules:
    // - public: anyone can view
    // - unlisted: anyone with link can view (we treat same as public here)
    // - private: only owner or explicitly shared users can view
    if (group.privacy === 'private') {
      if (!req.user?.id) return res.status(403).json({ message: 'Not authorized to view this group' });
      const isOwner = group.user.toString() === req.user.id;
      const isShared = (group.sharedWith || []).some((u) => u.toString() === req.user.id);
      if (!isOwner && !isShared) return res.status(403).json({ message: 'Not authorized to view this group' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error reading group:', error);
    res.status(500).json({ message: 'Server Error reading group' });
  }
};

const updateGroup = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'User not authenticated' });
    const id = req.params.id;
    const group = await LinkGroup.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { name, description, privacy } = req.body;
    if (name && name.toString().trim() && name !== group.name) {
      const slug = await generateUniqueSlugForUser(req.user.id, name);
      group.name = name.toString().trim();
      group.slug = slug;
    }
    if (typeof description !== 'undefined') group.description = description;
    if (privacy) group.privacy = privacy;

    await group.save();
    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Server Error updating group' });
  }
};

const deleteGroup = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'User not authenticated' });
    const id = req.params.id;
    const group = await LinkGroup.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    await group.remove();
    res.json({ message: 'Group deleted', id });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Server Error deleting group' });
  }
};

const addLink = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'User not authenticated' });
    const id = req.params.id;
    const { url, title, platform, meta } = req.body;
    if (!url) return res.status(400).json({ message: 'url is required' });

    const group = await LinkGroup.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const item = { url: url.toString(), title: title || '', platform: platform || 'web', meta: meta || {} };
    group.links.push(item);
    await group.save();

    // return the pushed item (last in array)
    const pushed = group.links[group.links.length - 1];
    res.status(201).json(pushed);
  } catch (error) {
    console.error('Error adding link:', error);
    res.status(500).json({ message: 'Server Error adding link' });
  }
};

const updateLink = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'User not authenticated' });
    const { id, linkId } = req.params;
    const { url, title, platform, meta } = req.body;

    const group = await LinkGroup.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const item = group.links.id(linkId);
    if (!item) return res.status(404).json({ message: 'Link not found' });

    if (typeof url !== 'undefined') item.url = url;
    if (typeof title !== 'undefined') item.title = title;
    if (typeof platform !== 'undefined') item.platform = platform;
    if (typeof meta !== 'undefined') item.meta = meta;

    await group.save();
    res.json(item);
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ message: 'Server Error updating link' });
  }
};

const removeLink = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'User not authenticated' });
    const { id, linkId } = req.params;
    const group = await LinkGroup.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const item = group.links.id(linkId);
    if (!item) return res.status(404).json({ message: 'Link not found' });

    item.remove();
    await group.save();
    res.json({ message: 'Link removed', linkId });
  } catch (error) {
    console.error('Error removing link:', error);
    res.status(500).json({ message: 'Server Error removing link' });
  }
};

// share a group with another user (by userId or email)
const shareGroup = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'User not authenticated' });
    const id = req.params.id;
    const { userId, email } = req.body;
    if (!userId && !email) return res.status(400).json({ message: 'userId or email is required to share' });

    const group = await LinkGroup.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    let targetUser = null;
    if (userId) targetUser = await User.findById(userId).select('_id');
    else if (email) targetUser = await User.findOne({ email: email.toString().toLowerCase() }).select('_id');
    if (!targetUser) return res.status(404).json({ message: 'Target user not found' });

    const targetId = targetUser._id.toString();
    if ((group.sharedWith || []).some((u) => u.toString() === targetId)) {
      return res.status(200).json({ message: 'Already shared', sharedWith: group.sharedWith });
    }

    group.sharedWith.push(targetUser._id);
    await group.save();
    res.status(200).json({ message: 'Group shared', sharedWith: group.sharedWith });
  } catch (error) {
    console.error('Error sharing group:', error);
    res.status(500).json({ message: 'Server Error sharing group' });
  }
};

// unshare (remove) a user from sharedWith
const unshareGroup = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'User not authenticated' });
    const id = req.params.id;
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: 'userId param is required' });

    const group = await LinkGroup.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.user.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const before = group.sharedWith.length;
    group.sharedWith = (group.sharedWith || []).filter((u) => u.toString() !== userId);
    if (group.sharedWith.length === before) return res.status(404).json({ message: 'User was not shared' });
    await group.save();
    res.json({ message: 'Unshared', sharedWith: group.sharedWith });
  } catch (error) {
    console.error('Error unsharing group:', error);
    res.status(500).json({ message: 'Server Error unsharing group' });
  }
};

// list groups shared with the authenticated user
const getGroupsSharedWithMe = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'User not authenticated' });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { sharedWith: req.user.id };
    const total = await LinkGroup.countDocuments(filter);
    const groups = await LinkGroup.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    res.json({ groups, total, pages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    console.error('Error fetching shared groups:', error);
    res.status(500).json({ message: 'Server Error fetching shared groups' });
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addLink,
  updateLink,
  removeLink,
  shareGroup,
  unshareGroup,
  getGroupsSharedWithMe,
};
