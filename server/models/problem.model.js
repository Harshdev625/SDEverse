const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    sheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProblemSheet",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    order: {
        type: Number,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true,
        lowercase: true,
        index: true,
    },
    platform: {
        type: String,
        enum: ['leetcode', 'hackerrank', 'codeforces', 'codechef', 'atcoder', 'other'],
        required: true,
    },
    platformLink: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid URL format',
        },
    },
    tags: {
        type: [String],
        default: [],
    },
    hints: [{
        hintNumber: Number,
        content: String,
    }],
    solution: {
        content: {
            python: String,
            javascript: String,
            java: String,
            cpp: String,
            csharp: String,
        },
        explanation: String,
    },
}, { timestamps: true });

// Index for efficient queries
problemSchema.index({ sheetId: 1, difficulty: 1 });
problemSchema.index({ sheetId: 1, order: 1 });

module.exports = mongoose.model('Problem', problemSchema);