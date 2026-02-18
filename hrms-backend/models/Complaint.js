const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
    adminReply: { type: String },
    repliedAt: { type: Date },
    attachmentUrl: { type: String, trim: true }, // Optional file upload (PDF/image)
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
