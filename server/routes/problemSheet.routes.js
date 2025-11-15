const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const { validateProblemSheet } = require('../middleware/validateProblemSheet');
const { validateProblem } = require('../middleware/validateProblem');
const problemSheetController = require('../controllers/problemSheet.controller');
const problemController = require('../controllers/problem.controller');

// ============= PUBLIC ROUTES =============
// These return only ACTIVE sheets for regular users
router.get('/', problemSheetController.getAllSheets);
router.get('/:sheetId', problemSheetController.getSheetById);

// ============= PROTECTED ADMIN ROUTES =============
// Get all sheets for admin (includes inactive sheets)
router.get(
  '/admin/all',
  protect,
  admin,
  problemSheetController.getAllSheetsAdmin
);

// ============= PROTECTED USER ROUTES =============
router.get('/:sheetId/problems', protect, problemSheetController.getSheetProblems);
router.get('/:sheetId/metrics', protect, problemSheetController.getSheetMetrics);

// ============= PROBLEM USER ROUTES =============
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

// ============= PROBLEM MANAGEMENT (ADMIN) =============
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

// ============= SHEET MANAGEMENT (ADMIN) =============
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

module.exports = router;