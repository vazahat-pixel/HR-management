const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    employeeName: { type: String },
    employeeId: { type: String },
    designation: { type: String },
    department: { type: String },
    basic: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    pickedCount: { type: Number, default: 0 },
    grossEarnings: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netPayable: { type: Number, default: 0 },
    paidDays: { type: Number, default: 0 },
    lopDays: { type: Number, default: 0 },
    workingDays: { type: Number, default: 0 },
    baseRate: { type: Number, default: 0 },
    finalBaseAmount: { type: Number, default: 0 },
}, { timestamps: true });

payslipSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
