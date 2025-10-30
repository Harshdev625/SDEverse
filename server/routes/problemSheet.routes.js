const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Public routes
router.get('/problem-sheets', problemSheetController.getAllSheets);
router.get('/problem-sheets/:sheetId', problemSheetController.getSheetById);

// Protected routes
router.get('/problem-sheets/:sheetId/problems', auth, problemSheetController.getSheetProblems);
router.get('/problem-sheets/:sheetId/metrics', auth, problemSheetController.getSheetMetrics);

router.post('/problems/:problemId/complete', auth, problemController.markProblemComplete);
router.get('/problems/:problemId/notes', auth, problemController.getProblemNotes);
router.put('/problems/:problemId/notes', auth, problemController.saveProblemNotes);
router.delete('/problems/:problemId/notes', auth, problemController.deleteProblemNotes);

router.get('/problems/:problemId/hints-solution', auth, problemController.getHintsSolution);
router.post('/problems/:problemId/unlock-hint', auth, problemController.unlockHint);
router.post('/problems/:problemId/unlock-solution', auth, problemController.unlockSolution);

module.exports = router;