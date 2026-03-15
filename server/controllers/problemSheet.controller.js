const mongoose = require('mongoose');
const ProblemSheet = require('../models/sheet.model');
const ProblemProgress = require('../models/userProgress.model');
const Problem = require('../models/problem.model');
const SheetProblem = require('../models/sheetProblem.model');
const generateUniqueSlug = require('../utils/generateUniqueSlug');
const useTransactions = process.env.NODE_ENV === 'production';

const problemSheetController = {
  // Admin controls:
  // Get all sheets
  getAllSheetsAdmin: async (req, res) => {
    try {
      const userId = req.user?._id;

      const sheets = await ProblemSheet.find()
        .select('name slug description icon totalProblems createdAt isActive')
        .lean();

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
  
  // Create Problem Sheet
  createProblemSheet: async (req, res) => {
    try {
      const { name, description, icon } = req.body;
      const slug = await generateUniqueSlug(name);
      
      const newSheet = new ProblemSheet({
        name, description, slug, icon: icon ||'📋',
      });

      const saveSheet = await newSheet.save();

      if (!saveSheet) {
        res.status(502).json({
          error: 'Problem sheet not created.'
        });
      }

      res.status(201).json(saveSheet);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          error: 'A problem sheet with this name already exists.'
        });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update Problem Sheet
  updateProblemSheet: async (req, res) => {
    try {
      const { slug } = req.params;
      const { name, description, icon, isActive } = req.body;
      
      let sheet = await ProblemSheet.findOne({ slug });

      if (!sheet) {
        return res.status(404).json({ error: 'Problem sheet not found' });
      };

      // regenerate slug if name changed
      if (name && name !== sheet.name) {
        sheet.name = name;
        sheet.slug = await generateUniqueSlug(name, ProblemSheet); 
      };

      if (description) {
        sheet.description = description;
      }

      if (icon) {
        sheet.icon = icon || sheet.icon;
      }

      if (isActive !== undefined && isActive !== null) {
        sheet.isActive = isActive;
      }

      const updateSheet = await sheet.save();

      if (!updateSheet) {
        res.status(502).json({
          error: 'Problem sheet not updated.'
        });
      }

      res.status(200).json(updateSheet);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          error: 'A problem sheet with this name already exists.'
        });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Delete Problem Sheet
  deleteProblemSheet: async (req, res) => {
    const session = useTransactions ? await mongoose.startSession() : null;
    
    try {
      if (session) {
        session.startTransaction();
      }

      const { slug } = req.params;
      const sessionOption = session ? { session } : {};

      const sheet = await ProblemSheet.findOne({ slug }).session(session);
      if (!sheet) {
        if (session) await session.abortTransaction();
        return res.status(404).json({ error: 'Problem sheet not found' });
      }

      // Delete all associated data
      const deleteSheetProblems = await SheetProblem.deleteMany({ sheetId: sheet._id }, sessionOption);
      const deleteProgress = await ProblemProgress.deleteMany({ sheetId: sheet._id }, sessionOption);
      const deleteSheet = await ProblemSheet.deleteOne({ _id: sheet._id }, sessionOption);

      if (!deleteSheet || deleteSheet.deletedCount === 0) {
        if (session) await session.abortTransaction();
        return res.status(502).json({
          error: 'Failed to delete sheet.'
        });
      }

      if (session) {
        await session.commitTransaction();
      }

      res.status(200).json({
        message: 'Problem sheet and all associated data deleted successfully.',
        deletedData: {
          sheet: deleteSheet.deletedCount,
          sheetProblems: deleteSheetProblems.deletedCount,
          progress: deleteProgress.deletedCount
        }
      });
    } catch (error) {
      if (session) await session.abortTransaction();
      res.status(500).json({ error: error.message });
    } finally {
      if (session) await session.endSession();
    }
  },

  // ============================================================

  // User controls:
  // Get active sheets
  getAllSheets: async (req, res) => {
    try {
      const userId = req.user?._id;

      const sheets = await ProblemSheet.find({ isActive: true })
        .select('name slug description icon totalProblems createdAt isActive')
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

      // Support both slug and ID
      let sheet;
      if (mongoose.Types.ObjectId.isValid(sheetId)) {
        sheet = await ProblemSheet.findById(sheetId).lean();
      } else {
        sheet = await ProblemSheet.findOne({ slug: sheetId }).lean();
      }
      
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

      // Find sheet by ID or slug
      let sheet;
      if (mongoose.Types.ObjectId.isValid(sheetId)) {
        sheet = await ProblemSheet.findById(sheetId).select('_id').lean();
      } else {
        sheet = await ProblemSheet.findOne({ slug: sheetId }).select('_id').lean();
      }

      if (!sheet) {
        return res.status(404).json({ error: 'Sheet not found' });
      }

      const skip = (pageNum - 1) * limitNum;

      // Build aggregation pipeline to join SheetProblems with Problems
      const pipeline = [
        { $match: { sheetId: sheet._id } },
        {
          $lookup: {
            from: 'problems',
            localField: 'problemId',
            foreignField: '_id',
            as: 'problemDetails'
          }
        },
        { $unwind: '$problemDetails' },
      ];

      // Add difficulty filter if specified
      if (difficulty && difficulty !== 'all') {
        pipeline.push({ 
          $match: { 'problemDetails.difficulty': difficulty } 
        });
      }

      // Add sorting and pagination
      pipeline.push(
        { $sort: { order: 1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            _id: '$problemDetails._id',
            title: '$problemDetails.title',
            description: '$problemDetails.description',
            difficulty: '$problemDetails.difficulty',
            platform: '$problemDetails.platform',
            platformLink: '$problemDetails.platformLink',
            tags: '$problemDetails.tags',
            order: '$order',
            createdAt: '$problemDetails.createdAt',
            updatedAt: '$problemDetails.updatedAt',
          }
        }
      );

      const problems = await SheetProblem.aggregate(pipeline);

      // Get total count
      const countPipeline = [
        { $match: { sheetId: sheet._id } },
        {
          $lookup: {
            from: 'problems',
            localField: 'problemId',
            foreignField: '_id',
            as: 'problemDetails'
          }
        },
        { $unwind: '$problemDetails' },
      ];

      if (difficulty && difficulty !== 'all') {
        countPipeline.push({ 
          $match: { 'problemDetails.difficulty': difficulty } 
        });
      }

      countPipeline.push({ $count: 'total' });
      const countResult = await SheetProblem.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;

      // If user is logged in, add progress info
      if (userId && problems.length > 0) {
        const problemIds = problems.map(p => p._id);
        const progress = await ProblemProgress.find(
          { problemId: { $in: problemIds }, userId, sheetId: sheet._id }
        ).lean();

        const progressMap = {};
        progress.forEach(p => {
          progressMap[p.problemId.toString()] = p;
        });

        problems.forEach(problem => {
          const prog = progressMap[problem._id.toString()];
          problem.completed = prog?.completed || false;
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

      // Find sheet by ID or slug
      let sheet;
      if (mongoose.Types.ObjectId.isValid(sheetId)) {
        sheet = await ProblemSheet.findById(sheetId).select('_id').lean();
      } else {
        sheet = await ProblemSheet.findOne({ slug: sheetId }).select('_id').lean();
      }

      if (!sheet) {
        return res.status(404).json({ error: 'Sheet not found' });
      }

      // Get problem difficulties via SheetProblem junction
      const problemsPipeline = [
        { $match: { sheetId: sheet._id } },
        {
          $lookup: {
            from: 'problems',
            localField: 'problemId',
            foreignField: '_id',
            as: 'problemDetails'
          }
        },
        { $unwind: '$problemDetails' },
      ];

      if (difficulty && difficulty !== 'all') {
        problemsPipeline.push({ 
          $match: { 'problemDetails.difficulty': difficulty } 
        });
      }

      problemsPipeline.push({
        $group: {
          _id: '$problemDetails.difficulty',
          total: { $sum: 1 }
        }
      });

      const problems = await SheetProblem.aggregate(problemsPipeline);

      // Get user progress
      const progressFilter = { sheetId: sheet._id, userId };

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