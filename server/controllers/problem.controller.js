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

  // Get hints and solution
  getHintsSolution: async (req, res) => {
    try {
      const { problemId } = req.params;
      const userId = req.user._id;

      const problem = await Problem.findById(problemId)
        .select('hints solution')
        .lean();

      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Get progress to check what user unlocked
      const progress = await ProblemProgress.findOne({
        problemId,
        userId,
      }).lean();

      // Format hints
      const hints = (problem.hints || []).map(hint => ({
        hintNumber: hint.hintNumber,
        content: hint.content,
        isUnlocked: progress?.unlockedHints?.includes(hint.hintNumber) || false,
      }));

      // Check if all hints are unlocked to allow solution unlock
      const allHintsUnlocked = hints.every(h => h.isUnlocked);

      res.status(200).json({
        data: {
          hints,
          solution: {
            isUnlocked: progress?.solutionUnlocked || false,
            canUnlock: allHintsUnlocked,
            content: progress?.solutionUnlocked ? problem.solution.content : null,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Unlock hint
  unlockHint: async (req, res) => {
    try {
      const { problemId } = req.params;
      const { hintNumber } = req.body;
      const userId = req.user._id;

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      const hint = problem.hints?.find(h => h.hintNumber === hintNumber);
      if (!hint) {
        return res.status(404).json({ error: 'Hint not found' });
      }

      // Get or create progress
      let progress = await ProblemProgress.findOne({ problemId, userId });
      if (!progress) {
        progress = new ProblemProgress({
          problemId,
          userId,
          sheetId: problem.sheetId,
          unlockedHints: [hintNumber],
        });
      } else {
        if (!progress.unlockedHints.includes(hintNumber)) {
          progress.unlockedHints.push(hintNumber);
        }
      }

      await progress.save();

      res.status(200).json({
        data: {
          content: hint.content,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Unlock solution
  unlockSolution: async (req, res) => {
    try {
      const { problemId } = req.params;
      const userId = req.user._id;

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      // Check if all hints are unlocked
      const progress = await ProblemProgress.findOne({ problemId, userId });
      if (!progress || progress.unlockedHints?.length !== problem.hints?.length) {
        return res.status(403).json({
          error: {
            message: 'Unlock all hints first to view the solution',
          },
        });
      }

      // Update progress
      progress.solutionUnlocked = true;
      progress.unlockedAt = new Date();
      await progress.save();

      res.status(200).json({
        data: {
          solution: problem.solution.content,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};