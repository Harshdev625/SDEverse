const mongoose = require('mongoose');

const problemNotesSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,    
    },
    content: {
        type: String,
        trim: true,
        default: '',
    },
}, { timestamps: true });

problemNotesSchema.index({ problemId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ProblemNotes', problemNotesSchema);