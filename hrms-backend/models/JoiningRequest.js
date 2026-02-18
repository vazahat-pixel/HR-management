const mongoose = require('mongoose');

const joiningRequestSchema = new mongoose.Schema({
    // Personal Details
    fullName: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    partnerName: { type: String, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },

    // Contact & Work
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    // Documents (Numbers)
    aadhaar: { type: String },
    pan: { type: String },
    accountName: { type: String }, // Bank Account Name
    accountNumber: { type: String }, // User input account number
    bankAccount: { type: String }, // Legacy/Internal bank account field
    ifscCode: { type: String },
    profileId: { type: String },
    officeLocation: { type: String },
    hubName: { type: String },

    // Document Images (Paths)
    photoUrl: { type: String },
    aadhaarImage: { type: String }, // Aadhaar Front
    aadhaarBackImage: { type: String }, // Aadhaar Back
    panImage: { type: String },

    // System
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    adminRemarks: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('JoiningRequest', joiningRequestSchema);
