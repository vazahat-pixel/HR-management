const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discount: { type: String, trim: true },
    provider: { type: String, trim: true },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
    eligibilityCriteria: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
