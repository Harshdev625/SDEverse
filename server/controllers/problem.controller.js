const mongoose = require('mongoose');
const Problem = require('../models/problem.model');
const ProblemSheet = require('../models/sheet.model');
const ProblemProgress = require('../models/userProgress.model');
const SheetProblem = require('../models/sheetProblem.model');

const problemController = {
  // Admin controls:
  // Create problem (independent of sheets)
  createProblem: async (req, res) => {
    try {
      const problemData = req.body;
      
      const newProblem = new Problem(problemData);
      const savedProblem = await newProblem.save();

      res.status(201).json(savedProblem);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ 
          error: 'A problem with this title already exists.' 
        });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Add problem to a sheet
  addProblemToSheet: async (req, res) => {
    try {
      const { sheetId, problemId } = req.params;
      const { order } = req.body;
      
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(sheetId)) {
        return res.status(400).json({ error: 'Invalid sheet ID' });
      }
      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ error: 'Invalid problem ID' });
      }
      
      const sheet = await ProblemSheet.findById(sheetId);
      if (!sheet) {
        return res.status(404).json({ error: 'Problem sheet not found' });
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Determine order if not provided
      let problemOrder = order;
      if (!problemOrder) {
        const maxOrder = await SheetProblem.findOne({ sheetId })
          .sort({ order: -1 })
          .select('order');
        problemOrder = maxOrder ? maxOrder.order + 1 : 1;
      }

      // Create sheet-problem relationship
      const sheetProblem = new SheetProblem({
        sheetId,
        problemId,
        order: problemOrder,
      });

      await sheetProblem.save();

      // Increment totalProblems count on the sheet
      await ProblemSheet.updateOne({ _id: sheetId }, { $inc: { totalProblems: 1 } });

      res.status(201).json({ 
        message: 'Problem added to sheet successfully',
        sheetProblem 
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ 
          error: 'This problem is already in the sheet.' 
        });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Remove problem from a sheet (doesn't delete the problem)
  removeProblemFromSheet: async (req, res) => {
    try {
      const { sheetId, problemId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(sheetId)) {
        return res.status(400).json({ error: 'Invalid sheet ID' });
      }
      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ error: 'Invalid problem ID' });
      }

      const sheetProblem = await SheetProblem.findOneAndDelete({
        sheetId,
        problemId,
      });

      if (!sheetProblem) {
        return res.status(404).json({ 
          error: 'Problem not found in this sheet' 
        });
      }

      // Decrement totalProblems count on the sheet
      await ProblemSheet.updateOne({ _id: sheetId }, { $inc: { totalProblems: -1 } });

      // Delete user progress for this problem in this sheet
      await ProblemProgress.deleteMany({ problemId, sheetId });

      res.status(200).json({ 
        message: 'Problem removed from sheet successfully' 
      });
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

      // Prevent updating title if it creates a duplicate
      if (updateData.title && updateData.title !== problem.title) {
        const existingProblem = await Problem.findOne({ title: updateData.title });
        if (existingProblem) {
          return res.status(400).json({ 
            error: 'A problem with this title already exists.' 
          });
        }
      }

      Object.assign(problem, updateData);

      const updatedProblem = await problem.save();
      res.status(200).json(updatedProblem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete Problem (removes from all sheets and deletes the problem)
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

      // Find all sheets this problem belongs to
      const sheetProblems = await SheetProblem.find({ problemId });
      const sheetIds = sheetProblems.map(sp => sp.sheetId);

      // Delete all sheet-problem relationships
      await SheetProblem.deleteMany({ problemId });

      // Delete the problem
      await Problem.deleteOne({ _id: problemId });

      // Delete all user progress for this problem
      await ProblemProgress.deleteMany({ problemId });

      // Decrement totalProblems count on all affected sheets
      if (sheetIds.length > 0) {
        await ProblemSheet.updateMany(
          { _id: { $in: sheetIds } }, 
          { $inc: { totalProblems: -1 } }
        );
      }

      res.status(200).json({ 
        message: 'Problem deleted successfully',
        affectedSheets: sheetIds.length 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ===========================================================

  // User controls:
  // Mark problem as complete
  markProblemComplete: async (req, res) => {
    try {
      const { problemId, sheetId } = req.params;
      const { completed } = req.body;
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ error: 'Invalid problem ID' });
      }
      if (!mongoose.Types.ObjectId.isValid(sheetId)) {
        return res.status(400).json({ error: 'Invalid sheet ID' });
      }

      // Verify problem exists
      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Verify problem is in the sheet
      const sheetProblem = await SheetProblem.findOne({ sheetId, problemId });
      if (!sheetProblem) {
        return res.status(404).json({ 
          error: 'Problem not found in this sheet' 
        });
      }

      // Upsert progress record
      let progress = await ProblemProgress.findOne({
        problemId,
        userId,
        sheetId,
      });

      if (!progress) {
        progress = new ProblemProgress({
          problemId,
          userId,
          sheetId,
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