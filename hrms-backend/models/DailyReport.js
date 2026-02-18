const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ehrId: {
        type: String,
        required: true,
        trim: true
    },
    hubName: {
        type: String,
        trim: true
    },
    ofd: {
        type: Number,
        default: 0
    },
    ofp: {
        type: Number,
        default: 0
    },
    delivered: {
        type: Number,
        default: 0
    },
    picked: {
        type: Number,
        default: 0
    },
    reportDate: {
        type: Date,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Unique index for employeeId + reportDate to prevent duplicate entries for same day
dailyReportSchema.index({ employeeId: 1, reportDate: 1 }, { unique: true });

module.exports = mongoose.model('DailyReport', dailyReportSchema);
