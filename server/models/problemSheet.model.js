const mongoose = require('mongoose');

const problemSheetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        default: '📋',  
    },
    totalProblems: {
        type: Number,
        default: 0, 
    },
    completedProblems: {
        type: Number,
        default: 0, 
    },
    progressPercentage: {
        type: Number,
        default: 0, 
    },
    isActive: {
        type: Boolean,
        default: true,
    }, 
}, { timestamps: true });

module.exports = mongoose.model('ProblemSheet', problemSheetSchema);