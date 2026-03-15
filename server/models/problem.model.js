const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true, // Ensure problem titles are unique across the system
    },
    description: {
        type: String,
        trim: true,
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
problemSchema.index({ difficulty: 1 });
problemSchema.index({ platform: 1 });
problemSchema.index({ tags: 1 });

module.exports = mongoose.model('Problem', problemSchema);