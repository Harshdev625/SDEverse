const mongoose = require('mongoose');
const Problem = require('../models/problem.model');
const ProblemSheet = require('../models/sheet.model');
const ProblemProgress = require('../models/userProgress.model');

const problemController = {
  // Admin controls:
  // Create problem
  createProblem: async (req, res) => {
    try {
      const { sheetId } = req.params;
      
      // Validate sheetId
      if (!mongoose.Types.ObjectId.isValid(sheetId)) {
        return res.status(400).json({ error: 'Invalid sheet ID' });
      }
      
      const sheet = await ProblemSheet.findById(sheetId).select('_id');
      
      if (!sheet) {
        return res.status(404).json({ error: 'Problem sheet not found' });
      }

      const problemData = req.body;
      
      const newProblem = new Problem({
        ...problemData,
        sheetId: sheet._id, 
      });

      const savedProblem = await newProblem.save();

      await ProblemSheet.updateOne({ _id: sheet._id }, { $inc: { totalProblems: 1 } });

      res.status(201).json(savedProblem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update Problem
  updateProblem: async (req, res) => {
    try {
      const { problemId } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ error: 'Invalid problem ID' });
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      Object.assign(problem, updateData);

      const updatedProblem = await problem.save();
      res.status(200).json(updatedProblem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete Problem
  deleteProblem: async (req, res) => {
    try {
      const { problemId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ error: 'Invalid problem ID' });
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      const sheetId = problem.sheetId;

      // Delete the problem
      await Problem.deleteOne({ _id: problem._id });

      // Delete all user progress for this problem
      await ProblemProgress.deleteMany({ problemId: problem._id });

      // Decrement totalProblems count on the sheet
      await ProblemSheet.updateOne({ _id: sheetId }, { $inc: { totalProblems: -1 } });

      res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ===========================================================

  // User controls:
  // Mark problem as complete
  markProblemComplete: async (req, res) => {
    try {
      const { problemId } = req.params;
      const { completed } = req.body;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ error: 'Invalid problem ID' });
      }

      // Get problem to find sheet
      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Upsert progress record
      let progress = await ProblemProgress.findOne({
        problemId,
        userId,
      });

      if (!progress) {
        progress = new ProblemProgress({
          problemId,
          userId,
          sheetId: problem.sheetId,
          completed,
          completedAt: completed ? new Date() : null,
        });
      } else {
        progress.completed = completed;
        progress.completedAt = completed ? new Date() : null;
      }

      await progress.save();

      res.status(200).json({
        problemId,
        completed,
        completedAt: progress.completedAt,
        _id: problemId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get hints and solution
  getHintsSolution: async (req, res) => {
    try {
      const { problemId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ error: 'Invalid problem ID' });
      }

      const problem = await Problem.findById(problemId)
        .select('hints solution')
        .lean();

      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Format hints
      const hints = (problem.hints || []).map(hint => ({
        hintNumber: hint.hintNumber,
        content: hint.content,
      }));

      res.status(200).json({
        data: {
          hints,
          solution: {
            content: problem.solution?.content,
            explanation: problem.solution?.explanation,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = problemController;