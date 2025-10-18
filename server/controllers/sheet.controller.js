const Sheet = require("../models/sheet.model");
const UserProgress = require("../models/userProgress.model");

const getSheet = async (req, res) => {
  try {
    const id = req.params.id;
    const sheet = await Sheet.findById(id);
    if (!sheet) {
      return res.status(404).json({ message: "sheet not found" });
    }
    res.status(200).json(sheet);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getAdminSheetMetrics = async (req, res) => {
  try {
    const sheets = await Sheet.find();

    const metrics = await Promise.all(
      sheets.map(async (sheet) => {
        const userProgressList = await UserProgress.find({ sheetId: sheet._id });
        const totalUsers = userProgressList.length;

        const completedUsers = userProgressList.filter(
          (progress) => progress.solvedQuestions.length === sheet.questions.length
        ).length;

        const avgCompletionPercent =
          userProgressList.reduce((acc, progress) => {
            const percent = (progress.solvedQuestions.length / sheet.questions.length) * 100;
            return acc + percent;
          }, 0) / (userProgressList.length || 1);

        return {
          sheetId: sheet._id,
          title: sheet.title,
          totalUsers,
          completedUsers,
          avgCompletionPercent: parseFloat(avgCompletionPercent.toFixed(2)),
        };
      })
    );

    res.status(200).json(metrics);
  } catch (e) {
    res.status(500).json({ error : e.message });
  }
};

const getAllSheets = async (req, res) => {
  try {
    const sheets = await Sheet.find();
    if (!sheets || sheets.length === 0) {
      return res.status(404).json({ message: "Sheets not found" });
    }
    res.status(200).json(sheets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const createSheet = async (req, res) => {
  try {
    const sheet = await Sheet.create(req.body);
    res.status(201).json(sheet);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

const updateSheet = async (req, res) => {
  try {
    const sheet = await Sheet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!sheet) {
      return res.status(404).json({ message: "Sheet not found" });
    }
    res.status(200).json(sheet);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

const deleteSheet = async (req, res) => {
  try {
    const sheet = await Sheet.findByIdAndDelete(req.params.id);
    if (!sheet) {
      return res.status(404).json({message : "Sheet not found"});
    }
    res.status(200).json(sheet);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

module.exports = {
  getSheet,
  getAllSheets,
  createSheet,
  updateSheet,
  deleteSheet,
  getAdminSheetMetrics
};
