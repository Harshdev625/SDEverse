const mongoose = require('mongoose');

const problemNotesSchema = new mongoose.Schema({
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
    content: {
        type: String,
        required: true,
        trim: true,
        default: '',
    },
}, { timestamps: true });

problemNotesSchema.index({ problemId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ProblemNotes', problemNotesSchema);