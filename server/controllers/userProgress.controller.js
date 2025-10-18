const UserProgress = require("../models/userProgress.model");
const Sheet = require("../models/sheet.model");
const userProgress = async (req, res) => {
  try {
    const allProgress = await UserProgress.find({
      userId: req.user._id,
    }).populate("sheetId", "title");
    if (allProgress.length === 0) {
      return res.status(404).json({ message: "No progress found" });
    }
    res.status(200).json(allProgress);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const userProgressSheetwise = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      userId: req.user._id,
      sheetId: req.params.sheetId,
    });
    const solvedQuestions = progress ? progress.solvedQuestions.length : 0;
    const sheet = await Sheet.findById(req.params.sheetId);
    const totalQuestions = sheet ? sheet.questions.length : 0;
    const totalEasyQuestions = sheet
      ? sheet.questions.reduce((count, q) => {
          return q.difficulty === "Easy" ? count + 1 : count;
        }, 0)
      : 0;
    const totalSolvedEasyQuestions = progress
      ? progress.solvedQuestions.reduce((count, q) => {
          return q.difficulty === "Easy" ? count + 1 : count;
        }, 0)
      : 0;
    const totalMediumQuestions = sheet
      ? sheet.questions.reduce((count, q) => {
          return q.difficulty === "Medium" ? count + 1 : count;
        }, 0)
      : 0;
    const totalSolvedMediumQuestions = progress
      ? progress.solvedQuestions.reduce((count, q) => {
          return q.difficulty === "Medium" ? count + 1 : count;
        }, 0)
      : 0;
    const totalHardQuestions = sheet
      ? sheet.questions.reduce((count, q) => {
          return q.difficulty === "Hard" ? count + 1 : count;
        }, 0)
      : 0;
    const totalSolvedHardQuestions = progress
      ? progress.solvedQuestions.reduce((count, q) => {
          return q.difficulty === "Hard" ? count + 1 : count;
        }, 0)
      : 0;

    res.status(200).json({
      totalQuestions,
      solvedQuestions,
      totalEasyQuestions,
      totalSolvedEasyQuestions,
      totalMediumQuestions,
      totalSolvedMediumQuestions,
      totalHardQuestions,
      totalSolvedHardQuestions,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  userProgress,
  userProgressSheetwise,
};
