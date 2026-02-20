const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
    fhrid: {
        type: String,
        required: true,
        trim: true
    },
    full_name: {
        type: String,
        trim: true
    },
    hub_name: {
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
    }
}, { timestamps: true });

// Unique index for fhrid + reportDate to prevent duplicate entries for same day
dailyReportSchema.index({ fhrid: 1, reportDate: 1 }, { unique: true });

module.exports = mongoose.model('DailyReport', dailyReportSchema);
