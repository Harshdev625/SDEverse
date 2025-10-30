const mongoose = require('mongoose');
const ProblemSheet = require('../models/problemSheet.model');
const ProblemProgress = require('../models/ProblemProgress.model');
const Problem = require('../models/problem.model');

const problemSheetController = {
  // Get all sheets
  getAllSheets: async (req, res) => {
    try {
      const userId = req.user?._id;

      const sheets = await ProblemSheet.find({ isActive: true })
        .select('name description icon totalProblems createdAt')
        .lean();

      // If user is logged in, fetch their progress
      if (userId) {
        const sheetIds = sheets.map(s => s._id);
        const progress = await ProblemProgress.aggregate([
          { $match: { sheetId: { $in: sheetIds }, userId } },
          { $group: {
              _id: '$sheetId',
              completedCount: { $sum: { $cond: ['$completed', 1, 0] } }
            }
          }
        ]);

        const progressMap = {};
        progress.forEach(p => {
          progressMap[p._id] = p.completedCount;
        });

        sheets.forEach(sheet => {
          sheet.completedProblems = progressMap[sheet._id] || 0;
          sheet.progressPercentage = sheet.completedProblems > 0
          ? (sheet.completedProblems / sheet.totalProblems) * 100
          : 0;
        });
      }

      res.status(200).json(sheets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get sheet by ID with all problems
  getSheetById: async (req, res) => {
    try {
      const { sheetId } = req.params;
      const userId = req.user?._id;

      const sheet = await ProblemSheet.findById(sheetId).lean();
      if (!sheet) {
        return res.status(404).json({ error: 'Sheet not found' });
      }

      // Get user's progress for this sheet
      if (userId) {
        const progress = await ProblemProgress.aggregate([
          { $match: { sheetId: new mongoose.Types.ObjectId(sheetId), userId } },
          { $group: {
              _id: null,
              completedCount: { $sum: { $cond: ['$completed', 1, 0] } }
            }
          }
        ]);

        const completed = progress[0]?.completedCount || 0;
        sheet.completedProblems = completed;
        sheet.progressPercentage = sheet.totalProblems > 0 
          ? (completed / sheet.totalProblems) * 100 
          : 0;
      }

      res.status(200).json(sheet);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get problems for a sheet with pagination
  getSheetProblems: async (req, res) => {
    try {
      const { sheetId } = req.params;
      const userId = req.user?._id;
      const { page = 1, limit = 15, difficulty } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ error: 'Invalid pagination parameters' });
      }

      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter = { sheetId: new mongoose.Types.ObjectId(sheetId) };
      if (difficulty && difficulty !== 'all') {
        filter.difficulty = difficulty;
      }

      // Fetch problems
      const problems = await Problem.find(filter)
        .select('-hints -solution')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ order: 1 })
        .lean();

      // Get total count for pagination
      const total = await Problem.countDocuments(filter);

      // If user is logged in, add progress info
      if (userId && problems.length > 0) {
        const problemIds = problems.map(p => p._id);
        const progress = await ProblemProgress.find(
          { problemId: { $in: problemIds }, userId }
        ).lean();

        const progressMap = {};
        progress.forEach(p => {
          progressMap[p.problemId] = p;
        });

        problems.forEach(problem => {
          const prog = progressMap[problem._id];
          problem.completed = prog?.completed || false;
          problem.hasNotes = !!prog?.notesId; // Can be checked differently
          problem.unlockedHints = prog?.unlockedHints || [];
          problem.solutionUnlocked = prog?.solutionUnlocked || false;
        });
      }

      res.status(200).json({
        problems,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProblems: total,
          hasNextPage: skip + parseInt(limit) < total,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get metrics for a sheet
  getSheetMetrics: async (req, res) => {
    try {
      const { sheetId } = req.params;
      const userId = req.user?._id;
      const { difficulty } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filter = { sheetId: new mongoose.Types.ObjectId(sheetId), userId };

      // Get problem difficulties
      let problemFilter = { sheetId: new mongoose.Types.ObjectId(sheetId) };
      if (difficulty && difficulty !== 'all') {
        problemFilter.difficulty = difficulty;
      }

      const problems = await Problem.aggregate([
        { $match: problemFilter },
        { $group: {
            _id: '$difficulty',
            total: { $sum: 1 }
          }
        }
      ]);

      // Get user progress
      let progressFilter = { sheetId: new Schema.Types.ObjectId(sheetId), userId };
      if (difficulty && difficulty !== 'all') {
        progressFilter.problemDifficulty = difficulty;
      }

      const progress = await ProblemProgress.aggregate([
        { $match: progressFilter },
        { $lookup: {
            from: 'problems',
            localField: 'problemId',
            foreignField: '_id',
            as: 'problem'
          }
        },
        { $unwind: '$problem' },
        ...(difficulty && difficulty !== 'all'
          ? [{ $match: { 'problem.difficulty': difficulty } }]
          : []
        ),
        { $group: {
            _id: '$problem.difficulty',
            completed: { $sum: { $cond: ['$completed', 1, 0] } },
            total: { $sum: 1 }
          }
        }
      ]);

      // Build metrics response
      const metrics = {
        overall: {
          totalProblems: 0,
          completedProblems: 0,
          progressPercentage: 0,
        },
        byDifficulty: {
          easy: { total: 0, completed: 0, percentage: 0 },
          medium: { total: 0, completed: 0, percentage: 0 },
          hard: { total: 0, completed: 0, percentage: 0 },
        },
      };

      // Populate problem counts
      problems.forEach(p => {
        if (metrics.byDifficulty[p._id]) {
          metrics.byDifficulty[p._id].total = p.total;
          metrics.overall.totalProblems += p.total;
        }
      });

      // Populate completion counts
      progress.forEach(p => {
        if (metrics.byDifficulty[p._id]) {
          metrics.byDifficulty[p._id].completed = p.completed;
          metrics.overall.completedProblems += p.completed;
        }
      });

      // Calculate percentages
      Object.keys(metrics.byDifficulty).forEach(difficulty => {
        const diff = metrics.byDifficulty[difficulty];
        diff.percentage = diff.total > 0 ? (diff.completed / diff.total) * 100 : 0;
      });

      if (metrics.overall.totalProblems > 0) {
        metrics.overall.progressPercentage =
          (metrics.overall.completedProblems / metrics.overall.totalProblems) * 100;
      }

      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = problemSheetController;