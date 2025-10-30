const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const problemSheetController = require('../controllers/problemSheet.controller');
const problemController = require('../controllers/problem.controller');

// Public routes
router.get('/', problemSheetController.getAllSheets);
router.get('/:sheetId', problemSheetController.getSheetById);

// Protected routes
router.get('/:sheetId/problems', protect, problemSheetController.getSheetProblems);
router.get('/:sheetId/metrics', protect, problemSheetController.getSheetMetrics);

// Problem routes
router.post('/problems/:problemId/complete', protect, problemController.markProblemComplete);
router.get('/problems/:problemId/notes', protect, problemController.getProblemNotes);
router.put('/problems/:problemId/notes', protect, problemController.saveProblemNotes);
router.delete('/problems/:problemId/notes', protect, problemController.deleteProblemNotes);

// Hints and Solution (no unlock tracking - frontend only)
router.get('/problems/:problemId/hints-solution', protect, problemController.getHintsSolution);

module.exports = router;