const asyncHandler = require("express-async-handler");
const Bookmark = require("../models/bookmark.model");
const Algorithm = require("../models/algorithm.model");
const DataStructure = require("../models/dataStructure.model");

// @desc    Add bookmark
// @route   POST /api/bookmarks
// @access  Private
const addBookmark = asyncHandler(async (req, res) => {
  const { contentType, contentId } = req.body;
  const userId = req.user._id;

  // Validate content type
  if (!["algorithm", "dataStructure"].includes(contentType)) {
    res.status(400);
    throw new Error("Invalid content type");
  }

  // Check if content exists
  const Model = contentType === "algorithm" ? Algorithm : DataStructure;
  const content = await Model.findById(contentId);
  
  if (!content) {
    res.status(404);
    throw new Error(`${contentType} not found`);
  }

  // Check if already bookmarked
  const existingBookmark = await Bookmark.findOne({
    user: userId,
    contentId,
    contentType,
  });

  if (existingBookmark) {
    res.status(400);
    throw new Error("Content already bookmarked");
  }

  // Create bookmark with error handling for duplicates
  try {
    const bookmark = await Bookmark.create({
      user: userId,
      contentType,
      contentId,
      contentModel: contentType === "algorithm" ? "Algorithm" : "DataStructure",
    });

    res.status(201).json({
      message: "Bookmark added successfully",
      bookmark,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Content already bookmarked");
    }
    throw error;
  }
});

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:contentId
// @access  Private
const removeBookmark = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  const { contentType } = req.query; // Get contentType from query params
  const userId = req.user._id;

  const query = { user: userId, contentId };
  if (contentType) {
    query.contentType = contentType;
  }

  const bookmark = await Bookmark.findOneAndDelete(query);

  if (!bookmark) {
    res.status(404);
    throw new Error("Bookmark not found");
  }

  res.json({ message: "Bookmark removed successfully" });
});

// @desc    Get user bookmarks
// @route   GET /api/bookmarks
// @access  Private
const getUserBookmarks = asyncHandler(async (req, res) => {
  const { contentType, page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  const query = { user: userId };
  if (contentType && ["algorithm", "dataStructure"].includes(contentType)) {
    query.contentType = contentType;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const bookmarks = await Bookmark.find(query)
    .populate({
      path: "contentId",
      select: "title slug category difficulty type createdAt",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Bookmark.countDocuments(query);

  res.json({
    bookmarks,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
});

// @desc    Check if content is bookmarked
// @route   GET /api/bookmarks/check/:contentId
// @access  Private
const checkBookmark = asyncHandler(async (req, res) => {
  const { contentId } = req.params;
  const userId = req.user._id;

  const bookmark = await Bookmark.findOne({
    user: userId,
    contentId,
  });

  res.json({ isBookmarked: !!bookmark });
});

module.exports = {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmark,
};