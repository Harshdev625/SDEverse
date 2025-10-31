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
        validate: {
            validator: function(v) {
                return v.length <= 5;
            },
            message: 'Icon must be at most 5 characters long'
        }
    },
    totalProblems: {
        type: Number,
        default: 0, 
    },
    completedProblems: {
        type: Number,
        default: 0,
        validate: {
            validator: function(v) {
                return v >= 0 && v <= this.totalProblems;
            },
            message: 'completedProblems must be between 0 and totalProblems'
        }
    },
    isActive: {
        type: Boolean,
        default: true,
    }, 
}, { timestamps: true });

problemSheetSchema.virtual('progressPercentage').get(function() {
    return this.totalProblems === 0 ? 0 : Math.round((this.completedProblems / this.totalProblems) * 100);
});

problemSheetSchema.set('toJSON', { virtuals: true });
problemSheetSchema.set('toObject', { virtuals: true });

problemSheetSchema.pre('save', function(next) {
    if (this.completedProblems > this.totalProblems) {
        return next(new Error('completedProblems cannot exceed totalProblems'));
    }
    if (this.completedProblems < 0) {
        return next(new Error('completedProblems cannot be negative'));
    }
    next();
});

module.exports = mongoose.model('ProblemSheet', problemSheetSchema);