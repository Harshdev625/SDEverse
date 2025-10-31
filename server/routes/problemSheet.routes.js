const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const problemSheetController = require('../controllers/problemSheet.controller');
const problemController = require('../controllers/problem.controller');

// Admin routes: Problem Sheets
router.post(
  '/', protect, admin, validateProblemSheet,
  problemSheetController.createProblemSheet
);
router.put(
  '/:slug', protect, admin, validateProblemSheet,
  problemSheetController.updateProblemSheet
);
router.delete(
  '/:slug', protect, admin,
  problemSheetController.deleteProblemSheet
);

// Admin routes: Problems
router.post(
  '/:sheetId/problems', protect, admin, validateProblem,
  problemController.createProblem
);
router.put(
  '/problems/:problemId', protect, admin, validateProblem,
  problemController.updateProblem
);
router.delete(
  '/problems/:problemId', protect, admin,
  problemController.deleteProblem
);


// Public routes
router.get('/', problemSheetController.getAllSheets);
router.get('/:sheetId', problemSheetController.getSheetById);

// Protected routes
router.get('/:sheetId/problems', protect, problemSheetController.getSheetProblems);
router.get('/:sheetId/metrics', protect, problemSheetController.getSheetMetrics);

// Problem routes
router.post('/problems/:problemId/complete', protect, problemController.markProblemComplete);

// Hints and Solution (no unlock tracking - frontend only)
router.get('/problems/:problemId/hints-solution', protect, problemController.getHintsSolution);

module.exports = router;