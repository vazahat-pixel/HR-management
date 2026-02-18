const mongoose = require('mongoose');

const advanceRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, trim: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    adminRemarks: { type: String },
    approvedAt: { type: Date },
    // New fields requested
    dateRequired: { type: Date },
    currentSalary: { type: Number },
    pendingAdvance: { type: Number, default: 0 },
    hubName: { type: String }, // Snapshot of hub at time of request
    // Additional required fields (optional for backward compatibility)
    email: { type: String, trim: true, lowercase: true },
    partnerName: { type: String, trim: true },
    profileId: { type: String, trim: true },
    phone: { type: String, trim: true },
    qrCodeUrl: { type: String, trim: true }, // Path to uploaded QR code (PDF/image)
}, { timestamps: true });

module.exports = mongoose.model('AdvanceRequest', advanceRequestSchema);
