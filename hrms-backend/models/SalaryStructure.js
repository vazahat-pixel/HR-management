const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    baseRate: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    otherAllowances: { type: Number, default: 0 },
    incentiveRate: { type: Number, default: 0 }, // Per delivery incentive
    tdsRate: { type: Number, default: 1 }, // Percentage
}, { timestamps: true });

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
