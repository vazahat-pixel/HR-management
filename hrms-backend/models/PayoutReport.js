const mongoose = require('mongoose');

const payoutReportSchema = new mongoose.Schema({
    fhrid: { type: String, required: true, trim: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },

    // Core Info
    profileId: { type: String },
    full_name: { type: String, trim: true },
    hub_name: { type: String, trim: true },
    accountNumber: { type: String },
    ifscCode: { type: String },

    // Attendance & Operations
    workingDays: { type: Number, default: 0 },
    totalAssigned: { type: Number, default: 0 },
    totalNormalDelivery: { type: Number, default: 0 },
    sopsyDelivered: { type: Number, default: 0 },
    gtnlDelivered: { type: Number, default: 0 },
    u2sShipment: { type: Number, default: 0 },
    totalDeliveryCount: { type: Number, default: 0 },
    conversion: { type: String }, // Storing as string because it's a percentage (e.g., "75%")

    // Rates & Allowances
    lmaBaseRate: { type: Number, default: 0 },
    lmaBasePayAmt: { type: Number, default: 0 },
    lmaPayAmt10P: { type: Number, default: 0 },
    sopsyBasePayAmt18P: { type: Number, default: 0 },
    gtnlBasePayAmt6P: { type: Number, default: 0 },
    u25BaseAmt: { type: Number, default: 0 },

    // Financials
    finalBasePayAmt: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    finalBaseAmount: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    totalPayAmount: { type: Number, default: 0 }, // Resultant Final Amount
    remark: { type: String },
}, { timestamps: true });

// Compound index to prevent duplicate (fhrid + month + year)
payoutReportSchema.index({ fhrid: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('PayoutReport', payoutReportSchema);
