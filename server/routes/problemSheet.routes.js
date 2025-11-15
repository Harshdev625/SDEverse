const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const { validateProblemSheet } = require('../middleware/validateProblemSheet');
const { validateProblem } = require('../middleware/validateProblem');
const problemSheetController = require('../controllers/problemSheet.controller');
const problemController = require('../controllers/problem.controller');

// Public routes
router.get('/', problemSheetController.getAllSheets);

// Problem Management 
router.post(
  '/:sheetId/problems', 
  protect, 
  admin, 
  validateProblem,
  problemController.createProblem
);

router.put(
  '/problems/:problemId', 
  protect, 
  admin, 
  validateProblem,
  problemController.updateProblem
);

router.delete(
  '/problems/:problemId', 
  protect, 
  admin,
  problemController.deleteProblem
);

router.post(
  '/problems/:problemId/complete', 
  protect, 
  problemController.markProblemComplete
);

router.get(
  '/problems/:problemId/hints-solution', 
  protect, 
  problemController.getHintsSolution
);

// Protected user routes
router.get('/:sheetId/problems', protect, problemSheetController.getSheetProblems);
router.get('/:sheetId/metrics', protect, problemSheetController.getSheetMetrics);

// Admin routes - Problem Sheet Management
router.post(
  '/', 
  protect, 
  admin, 
  validateProblemSheet,
  problemSheetController.createProblemSheet
);

router.put(
  '/:slug', 
  protect, 
  admin, 
  validateProblemSheet,
  problemSheetController.updateProblemSheet
);

router.delete(
  '/:slug', 
  protect, 
  admin,
  problemSheetController.deleteProblemSheet
);

// General sheet retrieval 
router.get('/:sheetId', problemSheetController.getSheetById);

module.exports = router;