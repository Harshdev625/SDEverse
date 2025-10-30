const Note = require('../models/noteModel');
const Algorithm = require('../models/algorithm.model');

const getNote = async (req, res) => {
  try {
    if (!req.user?.id || !req.params?.algorithmId) {
      return res.status(400).json({ message: "User ID or Algorithm ID missing" });
    }
    const note = await Note.findOne({
      user: req.user.id,
      algorithm: req.params.algorithmId,
    });
    if (note) {
      res.json(note);
    } else {
      res.json({ _id: null, user: req.user.id, algorithm: req.params.algorithmId, content: '' });
    }
  } catch (error) {
    console.error("Error getting single note:", error);
    res.status(500).json({ message: 'Server Error getting note' });
  }
};

const setNote = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const { algorithmId, content } = req.body;
    if (!algorithmId) {
      return res.status(400).json({ message: 'Algorithm ID is required' });
    }
    const note = await Note.findOneAndUpdate(
      { user: req.user.id, algorithm: algorithmId },
      { content: content === undefined ? '' : content },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(note);
  } catch (error) {
    console.error("Error setting note:", error);
    res.status(500).json({ message: 'Server Error setting note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    if (!req.user?.id || !req.params?.algorithmId) {
       return res.status(400).json({ message: "User ID or Algorithm ID missing" });
    }
    const note = await Note.findOneAndDelete({
      user: req.user.id,
      algorithm: req.params.algorithmId,
    });
    if (!note) {
      return res.status(200).json({ message: 'No note found to delete' });
    }
    res.status(200).json({ message: 'Note deleted successfully', id: note._id });
  } catch (error) {
    console.error("Error during note deletion:", error);
    res.status(500).json({ message: 'Server Error deleting note' });
  }
};

const getAllMyNotes = async (req, res) => {
  try {
     if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const query = { user: req.user.id };
    const totalNotes = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .populate({
         path: 'algorithm',
         select: 'title slug',
         model: 'Algorithm'
       })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
        notes,
        total: totalNotes,
        pages: Math.ceil(totalNotes / limit),
        currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching all user notes:", error);
    res.status(500).json({ message: 'Server Error fetching notes' });
  }
};

module.exports = { getNote, setNote, deleteNote, getAllMyNotes };