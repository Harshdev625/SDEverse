const Bookmark = require('../models/bookmark.model');
const Blog = require('../models/blog.model');
const Algorithm = require('../models/algorithm.model');
const DataStructure = require('../models/dataStructure.model');
const mongoose = require('mongoose');

const ALLOWED_PARENT_TYPES = (Bookmark && Bookmark.ALLOWED_PARENT_TYPES) || ['Algorithm', 'DataStructure', 'Blog'];

function isAllowedParentType(t) {
  return typeof t === 'string' && ALLOWED_PARENT_TYPES.includes(t);
}

const getBookmark = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ message: 'User ID missing' });
    }

    const query = { user: req.user.id };
    let emptyPayload = { _id: null, user: req.user.id };

    if (req.params?.parentType && req.params?.parentId) {
      const parentType = req.params.parentType;
      if (!isAllowedParentType(parentType)) {
        return res.status(400).json({ message: `parentType must be one of: ${ALLOWED_PARENT_TYPES.join(', ')}` });
      }
      query.parentType = parentType;
      query.parentId = req.params.parentId;
      emptyPayload.parentType = parentType;
      emptyPayload.parentId = req.params.parentId;
    } else {
      return res.status(400).json({ message: 'parentType and parentId are required in params' });
    }

    const bookmark = await Bookmark.findOne(query);
    if (bookmark) {
      res.json(bookmark);
    } else {
      res.json(emptyPayload);
    }
  } catch (error) {
    console.error('Error getting single bookmark:', error);
    res.status(500).json({ message: 'Server Error getting bookmark' });
  }
};

const setBookmark = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { parentType, parentId } = req.body;
    if (!parentType || !parentId) {
      return res.status(400).json({ message: 'parentType and parentId are required in body' });
    }
    if (!isAllowedParentType(parentType)) {
      return res.status(400).json({ message: `parentType must be one of: ${ALLOWED_PARENT_TYPES.join(', ')}` });
    }
    const filter = { user: req.user.id, parentType, parentId };

    // resolve the parent doc first so we can persist a stable link
    let parentDoc = null;
    if (parentType === 'Algorithm') parentDoc = await Algorithm.findById(parentId).select('slug title');
    else if (parentType === 'DataStructure') parentDoc = await DataStructure.findById(parentId).select('slug title');
    else if (parentType === 'Blog') parentDoc = await Blog.findById(parentId).select('slug title');

  const slug = parentDoc?.slug || '';
  const title = parentDoc?.title || '';
  let link = '';
  if (parentType === 'Algorithm') link = `/algorithms/${slug}`;
  else if (parentType === 'DataStructure') link = `/data-structures/${slug}`;
  else if (parentType === 'Blog') link = `/blogs/${slug}`;

    // Try to find an existing bookmark first to avoid upsert races that can
    // hit legacy unique indexes (for example if an old index uses different
    // field names like contentId/contentType). If not found, create a new
    // document. If a duplicate-key error still occurs, read and return the
    // existing document.
    try {
      let bookmark = await Bookmark.findOne(filter);
      if (bookmark) {
        bookmark.link = link;
        bookmark.title = title || bookmark.title || '';
        await bookmark.save();
        return res.status(200).json(bookmark);
      }

      // create a fresh bookmark and persist title+link for stable display
      const created = await Bookmark.create({ user: req.user.id, parentType, parentId, link, title });
      return res.status(200).json(created);
    } catch (err) {
      // handle duplicate key caused by legacy indexes or race conditions by
      // returning the existing document if possible
      console.error('Error creating/updating bookmark (attempt fallback):', err);
      if (err && err.code === 11000) {
        try {
          const existing = await Bookmark.findOne(filter);
          if (existing) return res.status(200).json(existing);
        } catch (inner) {
          console.error('Error reading existing bookmark after duplicate key:', inner);
        }
      }
      return res.status(500).json({ message: 'Server Error setting bookmark' });
    }
  } catch (error) {
    console.error('Error setting bookmark:', error);
    res.status(500).json({ message: 'Server Error setting bookmark' });
  }
};

const deleteBookmark = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ message: 'User ID missing' });
    }

    const filter = { user: req.user.id };
    if (req.params?.parentType && req.params?.parentId) {
      const parentType = req.params.parentType;
      if (!isAllowedParentType(parentType)) {
        return res.status(400).json({ message: `parentType must be one of: ${ALLOWED_PARENT_TYPES.join(', ')}` });
      }
      filter.parentType = parentType;
      filter.parentId = req.params.parentId;
    } else {
      return res.status(400).json({ message: 'parentType and parentId are required in params' });
    }

    const bookmark = await Bookmark.findOneAndDelete(filter);
    if (!bookmark) {
      return res.status(200).json({ message: 'No bookmark found to delete' });
    }
    res.status(200).json({ message: 'Bookmark deleted successfully', id: bookmark._id });
  } catch (error) {
    console.error('Error during bookmark deletion:', error);
    res.status(500).json({ message: 'Server Error deleting bookmark' });
  }
};
const getAllMyBookmarks = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const q = (req.query.q || '').trim().toLowerCase();
    const parentTypeFilter = req.query.parentType || '';

    const query = { user: req.user.id };
    if (parentTypeFilter) {
      if (!isAllowedParentType(parentTypeFilter)) {
        return res.status(400).json({ message: `parentType must be one of: ${ALLOWED_PARENT_TYPES.join(', ')}` });
      }

      const collectionMap = {
        Algorithm: 'algorithms',
        DataStructure: 'datastructures',
        Blog: 'blogs',
      };

      const from = collectionMap[parentTypeFilter];

      // ensure user id is a valid ObjectId instance for aggregation
      let userObjectId;
      if (mongoose.Types.ObjectId.isValid(req.user.id)) {
        userObjectId = new mongoose.Types.ObjectId(req.user.id);
      } else {
        return res.status(400).json({ message: 'Invalid user id' });
      }

      const matchStage = { user: userObjectId, parentType: parentTypeFilter };

      const pipeline = [
        { $match: matchStage },
        { $lookup: { from, localField: 'parentId', foreignField: '_id', as: 'parent' } },
        { $unwind: { path: '$parent', preserveNullAndEmptyArrays: true } },
      ];

      if (q) {
        pipeline.push({ $match: { $or: [{ 'parent.title': { $regex: q, $options: 'i' } }, { 'parent.slug': { $regex: q, $options: 'i' } }] } });
      }

      const countPipeline = [...pipeline, { $count: 'count' }];
      const totalAgg = await Bookmark.aggregate(countPipeline);
      const total = (totalAgg[0] && totalAgg[0].count) || 0;

      pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit });

      const results = await Bookmark.aggregate(pipeline);

        const mapped = results.map((r) => {
        const obj = r;
        const p = r.parent || {};
        const slug = p.slug || '';
        const titleFromParent = p.title || '';
        let link = '';
        if (obj.parentType === 'Algorithm') link = `/algorithms/${slug}`;
        else if (obj.parentType === 'DataStructure') link = `/data-structures/${slug}`;
        else if (obj.parentType === 'Blog') link = `/blogs/${slug}`;
        // prefer stored title on bookmark if present, otherwise use parent title
        const title = obj.title || titleFromParent || '';
        return { ...obj, link, title, parentId: p };
      });

      res.json({ bookmarks: mapped, total, pages: Math.ceil(total / limit), currentPage: page });
      return;
    }

    let bookmarks = await Bookmark.find(query).populate({ path: 'parentId', select: 'title slug', refPath: 'parentType' }).sort({ createdAt: -1 });

    if (q) {
      bookmarks = bookmarks.filter((b) => {
        const p = b.parentId || {};
        const title = (p.title || '').toString().toLowerCase();
        const slug = (p.slug || '').toString().toLowerCase();
        return title.includes(q) || slug.includes(q);
      });
    }

      const mapped = bookmarks.map((b) => {
      const obj = b && b.toObject ? b.toObject() : JSON.parse(JSON.stringify(b));
      const p = obj.parentId || {};
      const slug = p.slug || '';
      let link = obj.link || '';
      if (!link) {
        if (obj.parentType === 'Algorithm') link = `/algorithms/${slug}`;
        else if (obj.parentType === 'DataStructure') link = `/data-structures/${slug}`;
        else if (obj.parentType === 'Blog') link = `/blogs/${slug}`;
      }
      // prefer stored title field, otherwise fall back to populated parent title
      const title = obj.title || (p.title || '');
      return { ...obj, link, title };
    });

    const total = mapped.length;
    const paged = mapped.slice(skip, skip + limit);

    res.json({ bookmarks: paged, total, pages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    res.status(500).json({ message: 'Server Error fetching bookmarks' });
  }
};

module.exports = { getBookmark, setBookmark, deleteBookmark, getAllMyBookmarks };
