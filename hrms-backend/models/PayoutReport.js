const mongoose = require('mongoose');

const payoutReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    profileId: { type: String },
    wmName: { type: String },
    hubName: { type: String },
    fhrId: { type: String },
    workingDays: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    pickedCount: { type: Number, default: 0 },
    baseRate: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    finalBaseAmount: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    totalPayAmount: { type: Number, default: 0 },
    remark: { type: String },
    status: { type: String, enum: ['Generated', 'Approved', 'Paid'], default: 'Generated' },
}, { timestamps: true });

payoutReportSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('PayoutReport', payoutReportSchema);
