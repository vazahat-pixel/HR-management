const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    employeeId: { type: String, unique: true, sparse: true }, // Auto-generated
    ehrId: { type: String, unique: true, sparse: true },      // Manual CasperEHRID

    // Personal Details
    fullName: { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    partnerName: { type: String, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },

    // Contact & Work
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    hubName: { type: String, trim: true },
    officeLocation: { type: String, trim: true },

    // Documents
    aadhaar: { type: String }, // Encrypted
    pan: { type: String }, // Encrypted
    photoUrl: { type: String, trim: true },
    aadhaarImage: { type: String, trim: true }, // Front
    aadhaarBackImage: { type: String, trim: true }, // Back
    panImage: { type: String, trim: true },

    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['employee', 'admin', 'hr', 'pending', 'rejected'],
        default: 'employee'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending', 'Suspended', 'Rejected'],
        default: 'Active'
    },
    isApproved: { type: Boolean, default: false }, // Controls login access (Legacy)
    isAccountActivated: { type: Boolean, default: false }, // Controls login access (New)
    isProfileCompleted: { type: Boolean, default: false }, // Forces profile completion
    isSelfRegistered: { type: Boolean, default: false }, // True if user set their own password

    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    bankAccount: { type: String, trim: true }, // Keeping for backwards compatibility
    accountName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    baseRate: { type: Number, default: 0 },
    fhrId: { type: String, trim: true },
    profileId: { type: String, trim: true },
    conveyance: { type: Number, default: 0 },
    fcmToken: { type: String, trim: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Mask bank account in JSON response
const { maskAadhaar, maskPan } = require('../middleware/encrypt');

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    if (obj.bankAccount && obj.bankAccount.length > 4) {
        obj.bankAccount = '****' + obj.bankAccount.slice(-4);
    }
    if (obj.aadhaar) {
        obj.aadhaar = maskAadhaar(obj.aadhaar);
    }
    if (obj.pan) {
        obj.pan = maskPan(obj.pan);
    }
    return obj;
};

module.exports = mongoose.model('User', userSchema);
