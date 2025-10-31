const Problem = require('../models/problem.model');
const ProblemProgress = require('../models/userProgress.model');

const problemController = {
  // Admin controls:
  // Create problem
  createProblem: async (req, res) => {
    try {
      const { sheetId } = req.params; // sheetId can be slug or ID
      
      const query = mongoose.Types.ObjectId.isValid(sheetId)
        ? { _id: sheetId }
        : { slug: sheetId };
      const sheet = await ProblemSheet.findOne(query).select('_id');
      
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

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      const sheetId = problem.sheetId;

      // Delete the problem
      await problem.deleteOne();

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
        data: {
          problemId,
          completed,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get hints and solution (no unlock tracking needed on backend)
  getHintsSolution: async (req, res) => {
    try {
      const { problemId } = req.params;

      const problem = await Problem.findById(problemId)
        .select('hints solution')
        .lean();

      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Format hints - return all hints with content, no unlock tracking
      const hints = (problem.hints || []).map(hint => ({
        hintNumber: hint.hintNumber,
        content: hint.content,
      }));

      res.status(200).json({
        data: {
          hints,
          solution: {
            content: problem.solution?.content,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = problemController;