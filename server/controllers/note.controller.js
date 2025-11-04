const mongoose = require('mongoose');
const Note = require("../models/note.model");

const ALLOWED_PARENT_TYPES = (Note && Note.ALLOWED_PARENT_TYPES) || [
  "Algorithm",
  "DataStructure",
];

function isAllowedParentType(t) {
  return typeof t === "string" && ALLOWED_PARENT_TYPES.includes(t);
}

const getNote = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ message: "User ID missing" });
    }

    const query = { user: req.user.id };
    let emptyPayload = { _id: null, user: req.user.id, content: "" };

    if (req.params?.parentType && req.params?.parentId) {
      const parentType = req.params.parentType;
      if (!isAllowedParentType(parentType)) {
        return res
          .status(400)
          .json({
            message: `parentType must be one of: ${ALLOWED_PARENT_TYPES.join(
              ", "
            )}`,
          });
      }
      query.parentType = parentType;
      query.parentId = req.params.parentId;
      emptyPayload.parentType = parentType;
      emptyPayload.parentId = req.params.parentId;
    } else {
      return res
        .status(400)
        .json({ message: "parentType and parentId are required in params" });
    }

    const note = await Note.findOne(query);
    if (note) {
      res.json(note);
    } else {
      res.json(emptyPayload);
    }
  } catch (error) {
    console.error("Error getting single note:", error);
    res.status(500).json({ message: "Server Error getting note" });
  }
};

const setNote = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { parentType, parentId, content } = req.body;
    if (!parentType || !parentId) {
      return res
        .status(400)
        .json({ message: "parentType and parentId are required in body" });
    }
    if (!isAllowedParentType(parentType)) {
      return res
        .status(400)
        .json({
          message: `parentType must be one of: ${ALLOWED_PARENT_TYPES.join(
            ", "
          )}`,
        });
    }
    const payload = {
      parentType,
      parentId,
      content: content === undefined ? "" : content,
    };
    const filter = { user: req.user.id, parentType, parentId };

    const note = await Note.findOneAndUpdate(filter, payload, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
    res.status(200).json(note);
  } catch (error) {
    console.error("Error setting note:", error);
    res.status(500).json({ message: "Server Error setting note" });
  }
};

const deleteNote = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ message: "User ID missing" });
    }

    const filter = { user: req.user.id };
    if (req.params?.parentType && req.params?.parentId) {
      const parentType = req.params.parentType;
      if (!isAllowedParentType(parentType)) {
        return res
          .status(400)
          .json({
            message: `parentType must be one of: ${ALLOWED_PARENT_TYPES.join(
              ", "
            )}`,
          });
      }
      filter.parentType = parentType;
      filter.parentId = req.params.parentId;
    } else {
      return res
        .status(400)
        .json({ message: "parentType and parentId are required in params" });
    }

    const note = await Note.findOneAndDelete(filter);
    if (!note) {
      return res.status(200).json({ message: "No note found to delete" });
    }
    res
      .status(200)
      .json({ message: "Note deleted successfully", id: note._id });
  } catch (error) {
    console.error("Error during note deletion:", error);
    res.status(500).json({ message: "Server Error deleting note" });
  }
};

const getAllMyNotes = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
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
        const qEscaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pipeline.push({ $match: { $or: [{ 'parent.title': { $regex: qEscaped, $options: 'i' } }, { 'parent.slug': { $regex: qEscaped, $options: 'i' } }] } });
      }

      const countPipeline = [...pipeline, { $count: 'count' }];
      const totalAgg = await Note.aggregate(countPipeline);
      const total = (totalAgg[0] && totalAgg[0].count) || 0;

      pipeline.push({ $sort: { updatedAt: -1 } }, { $skip: skip }, { $limit: limit });

      const results = await Note.aggregate(pipeline);

      const mapped = results.map((r) => {
        const obj = r;
        const p = r.parent || {};
        const slug = p.slug || '';
        return { ...obj, parentId: p };
      });

      return res.json({ notes: mapped, total, pages: Math.ceil(total / limit), currentPage: page });
    }

    // no parentType filter: simple populate + optional q filter in-memory
    const totalNotes = await Note.countDocuments(query);
    let notes = await Note.find(query)
      .populate({ path: 'parentId', select: 'title slug', refPath: 'parentType' })
      .sort({ updatedAt: -1 });

    if (q) {
      notes = notes.filter((n) => {
        const p = n.parentId || {};
        const title = (p.title || '').toString().toLowerCase();
        const slug = (p.slug || '').toString().toLowerCase();
        const content = (n.content || '').toString().toLowerCase();
        return title.includes(q) || slug.includes(q) || content.includes(q);
      });
    }

    const mapped = notes.map((b) => {
      const obj = b && b.toObject ? b.toObject() : JSON.parse(JSON.stringify(b));
      return { ...obj };
    });

    const total = mapped.length;
    const paged = mapped.slice(skip, skip + limit);

    res.json({ notes: paged, total, pages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    console.error("Error fetching all user notes:", error);
    res.status(500).json({ message: "Server Error fetching notes" });
  }
};

module.exports = { getNote, setNote, deleteNote, getAllMyNotes };