const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
    fhrid: { type: String, required: true, trim: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    employeeName: { type: String, trim: true },
    designation: { type: String, trim: true },
    doj: { type: String },
    payPeriod: { type: String },
    payDate: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },

    // Attendance Info
    paidDays: { type: Number, default: 0 },
    lopDays: { type: Number, default: 0 },

    // Earnings
    basic: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 },
    grossEarnings: { type: Number, default: 0 },

    // Deductions
    tds: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },

    // Final
    netPayable: { type: Number, default: 0 },

    // Meta
    pdfPath: { type: String },
    excelRowData: { type: Object } // Optional: Store original row
}, { timestamps: true });

// Compound index to prevent duplicate (fhrid + month + year)
payslipSchema.index({ fhrid: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
