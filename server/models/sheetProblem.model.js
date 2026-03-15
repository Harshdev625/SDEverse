const mongoose = require('mongoose');

// Junction table for many-to-many relationship between sheets and problems
const sheetProblemSchema = new mongoose.Schema({
    sheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProblemSheet",
        required: true,
        index: true,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
        index: true,
    },
    order: {
        type: Number,
        required: true,
        default: 0,
    },
    // Optional: can add sheet-specific metadata here
    notes: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

// Composite index to ensure unique problem-sheet combinations
sheetProblemSchema.index({ sheetId: 1, problemId: 1 }, { unique: true });

// Index for efficient ordering queries
sheetProblemSchema.index({ sheetId: 1, order: 1 });

module.exports = mongoose.model('SheetProblem', sheetProblemSchema);
