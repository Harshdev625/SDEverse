const mongoose = require('mongoose');

const problemProgressSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,    
    },
    sheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProblemSheet",
        index: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
    },
    unlockedHints: {
        type: [Number], 
        default: [],
    },
    solutionUnlocked: {
        type: Boolean,
        default: false, 
    },
}, { timestamps: true });

problemProgressSchema.index({ problemId: 1, userId: 1, sheetId: 1 }, { unique: true });

module.exports = mongoose.model('ProblemProgress', problemProgressSchema);