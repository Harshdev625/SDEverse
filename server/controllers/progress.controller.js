const asyncHandler = require("express-async-handler");
const UserProgress = require("../models/userProgress.model");
const Sheet = require("../models/sheet.model");

// Get my progress for a sheet
const getMyProgress = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;
  const sheet = await Sheet.findById(sheetId).select("_id");
  if (!sheet) {
    res.status(404);
    throw new Error("Sheet not found");
  }
  const progress = await UserProgress.findOne({ user: req.user._id, sheet: sheetId });
  res.json(progress || { user: req.user._id, sheet: sheetId, solvedCount: 0 });
});

// Increment solved count by 1
const incrementSolved = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;
  const sheet = await Sheet.findById(sheetId).select("_id");
  if (!sheet) {
    res.status(404);
    throw new Error("Sheet not found");
  }
  const updated = await UserProgress.findOneAndUpdate(
    { user: req.user._id, sheet: sheetId },
    { $inc: { solvedCount: 1 } },
    { new: true, upsert: true }
  );
  res.json(updated);
});

// Set solved count explicitly
const setSolvedCount = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;
  const { solvedCount } = req.body;
  if (typeof solvedCount !== "number" || solvedCount < 0) {
    res.status(400);
    throw new Error("'solvedCount' must be a non-negative number");
  }
  const sheet = await Sheet.findById(sheetId).select("_id");
  if (!sheet) {
    res.status(404);
    throw new Error("Sheet not found");
  }
  const updated = await UserProgress.findOneAndUpdate(
    { user: req.user._id, sheet: sheetId },
    { $set: { solvedCount } },
    { new: true, upsert: true }
  );
  res.json(updated);
});

module.exports = { getMyProgress, incrementSolved, setSolvedCount };
