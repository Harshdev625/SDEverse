const mongoose = require('mongoose');

const problemProgressSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        index: true,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
        required: true,
    },
    sheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProblemSheet",
        index: true,
        required: true,
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

problemProgressSchema.pre('save', function(next) {
    if (this.isModified('completed') && this.completed && !this.completedAt) {
        this.completedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('ProblemProgress', problemProgressSchema);