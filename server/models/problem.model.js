const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    sheetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "problemSheet",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        tag: [String],
        platforms: {
            type: [String],
            required: true,
            validate: {
                validator: function(arr) {
                    const validPlatforms = ['LeetCode', 'HackerRank', 'CodeChef', 'CodeForces', 'AtCoder', 'Other'];
                    return arr.every(platform => validPlatforms.includes(platform));
                },
                message: props => `Invalid platform in array: ${props.value}`
            }
        },
    },
    order: {
        type: Number,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true,
        index: true,
    },
    platformLinks: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    hints: {
        hintNumber: {
            type: Number,
        },
        hintText: {
            type: [String],
            default: [],
        },
        unlockedBy: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
        }
    },
    solution: {
        content: {
            python: { type: String },
            javascript: { type: String },
            java: { type: String },
            cpp: { type: String },
        },
        unlockedBy: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
        },
    }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);