const Problem = require('../models/problem.model');
const ProblemProgress = require('../models/problemProgress.model');
const ProblemNotes = require('../models/problemNote.model');

const problemController = {
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

  // Get problem notes
  getProblemNotes: async (req, res) => {
    try {
      const { problemId } = req.params;
      const userId = req.user._id;

      let notes = await ProblemNotes.findOne({ problemId, userId });

      if (!notes) {
        notes = { content: '' };
      }

      res.status(200).json({
        data: {
          content: notes.content || '',
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Save problem notes
  saveProblemNotes: async (req, res) => {
    try {
      const { problemId } = req.params;
      const { content } = req.body;
      const userId = req.user._id;

      let notes = await ProblemNotes.findOne({ problemId, userId });

      if (!notes) {
        notes = new ProblemNotes({
          problemId,
          userId,
          content,
        });
      } else {
        notes.content = content;
        notes.updatedAt = new Date();
      }

      await notes.save();

      res.status(200).json({
        message: 'Notes saved successfully',
        data: notes,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete problem notes
  deleteProblemNotes: async (req, res) => {
    try {
      const { problemId } = req.params;
      const userId = req.user._id;

      await ProblemNotes.deleteOne({ problemId, userId });

      res.status(200).json({ message: 'Notes deleted successfully' });
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

      // Return solution content directly - no unlock tracking on backend
      res.status(200).json({
        data: {
          hints,
          solution: {
            content: problem.solution.content,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = problemController;