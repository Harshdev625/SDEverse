const asyncHandler = require("express-async-handler");
const Sheet = require("../models/sheet.model");
const generateUniqueSlug = require("../utils/generateUniqueSlug");

// Create Sheet (Admin)
const createSheet = asyncHandler(async (req, res) => {
  const { title, description, difficulty = "Mixed", platform = "Other", tags = [] } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error("Title and description are required");
  }

  const slug = await generateUniqueSlug(title);

  const sheet = await Sheet.create({
    title,
    slug,
    description,
    difficulty,
    platform,
    tags,
    createdBy: req.user?._id,
  });

  res.status(201).json(sheet);
});

// List Sheets (Public)
const listSheets = asyncHandler(async (req, res) => {
  const { platform, difficulty, search = "" } = req.query;
  const filter = {};
  if (platform) filter.platform = platform;
  if (difficulty) filter.difficulty = difficulty;
  if (search) filter.$or = [
    { title: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];
  const sheets = await Sheet.find(filter).sort({ createdAt: -1 });
  res.json(sheets);
});

// Get Sheet by Slug (Public)
const getSheetBySlug = asyncHandler(async (req, res) => {
  const sheet = await Sheet.findOne({ slug: req.params.slug });
  if (!sheet) {
    res.status(404);
    throw new Error("Sheet not found");
  }
  res.json(sheet);
});

// Update Sheet (Admin)
const updateSheet = asyncHandler(async (req, res) => {
  const sheet = await Sheet.findById(req.params.id);
  if (!sheet) {
    res.status(404);
    throw new Error("Sheet not found");
  }

  const allowed = ["title", "description", "difficulty", "platform", "tags", "isPublished"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      sheet[key] = req.body[key];
    }
  }
  if (req.body.title && req.body.title !== sheet.title) {
    sheet.slug = await generateUniqueSlug(req.body.title);
  }
  sheet.updatedBy = req.user?._id;
  const updated = await sheet.save();
  res.json(updated);
});

// Delete Sheet (Admin)
const deleteSheet = asyncHandler(async (req, res) => {
  const sheet = await Sheet.findById(req.params.id);
  if (!sheet) {
    res.status(404);
    throw new Error("Sheet not found");
  }
  await sheet.deleteOne();
  res.json({ message: "Sheet deleted" });
});

module.exports = { createSheet, listSheets, getSheetBySlug, updateSheet, deleteSheet };
