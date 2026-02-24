const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const JoiningRequest = require('../models/JoiningRequest');
const Notification = require('../models/Notification');
const { encrypt } = require('../middleware/encrypt');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { sendOTP } = require('../services/smsService');
const { sendNotification } = require('../services/notificationService');

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, employeeId: user.employeeId, fhrId: user.fhrId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Generate random password
const generatePassword = () => {
    return crypto.randomBytes(4).toString('hex') + 'A1!';
};

// POST /api/auth/login — Employee ID + Password
router.post('/login', async (req, res) => {
    try {
        const { employeeId, password, fhrId } = req.body;
        const rawIdentifier = (fhrId || employeeId || "").toString().trim();

        console.log(`🔐 Login Attempt: identifier=${rawIdentifier}, passLen=${password?.length}`);

        if (!rawIdentifier || !password) {
            return res.status(400).json({ error: 'Employee ID/Mobile and password are required.' });
        }

        // Escape regex special characters for safe matching
        const escapedId = rawIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const user = await User.findOne({
            $or: [
                { fhrId: escapedId },
                { employeeId: escapedId },
                { mobile: rawIdentifier },
                { fhrId: { $regex: new RegExp(`^${escapedId}$`, 'i') } },
                { employeeId: { $regex: new RegExp(`^${escapedId}$`, 'i') } },
                { email: { $regex: new RegExp(`^${escapedId}$`, 'i') } }
            ]
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Admin Bypass
        if (user.role === 'admin') {
            // Admins are always allowed (unless we implement a specific ban for admins later)
        } else {
            // Strict checks for Employees/Pending
            if (user.role === 'pending' || !user.isAccountActivated) {
                return res.status(403).json({ error: 'Your account is pending approval. Please wait for HR confirmation.' });
            }
            if (user.role === 'rejected') {
                return res.status(403).json({ error: 'Your application was rejected.' });
            }
            if (user.status !== 'Active') {
                return res.status(403).json({ error: 'Account is inactive. Contact admin.' });
            }
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = generateToken(user);
        res.json({ token, user: user.toJSON() });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// POST /api/auth/send-otp — Send OTP to mobile (placeholder)
router.post('/send-otp', async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ error: 'Mobile number is required.' });

        const user = await User.findOne({ mobile });
        if (!user) return res.status(404).json({ error: 'No account found with this mobile number.' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP temporarily
        global._otpStore = global._otpStore || {};
        global._otpStore[mobile] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

        // Send via SMS service
        await sendOTP(mobile, otp);

        res.json({ message: 'OTP sent successfully.' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP.' });
    }
});

// POST /api/auth/verify-otp — Verify OTP and login
router.post('/verify-otp', async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) return res.status(400).json({ error: 'Mobile and OTP are required.' });

        const stored = global._otpStore?.[mobile];
        if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
            return res.status(401).json({ error: 'Invalid or expired OTP.' });
        }

        // Clear used OTP
        delete global._otpStore[mobile];

        const user = await User.findOne({ mobile });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Status checks
        if (user.role === 'admin') {
            // Admin allowed
        } else {
            if (user.role === 'pending' || !user.isAccountActivated) {
                return res.status(403).json({ error: 'Your account is pending approval.' });
            }
            if (user.role === 'rejected') {
                return res.status(403).json({ error: 'Your application was rejected.' });
            }
            if (user.status !== 'Active') {
                return res.status(403).json({ error: 'Account is inactive.' });
            }
        }

        const token = generateToken(user);
        res.json({ token, user: user.toJSON() });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'OTP verification failed.' });
    }
});

const { uploadCloud } = require('../services/cloudinary');

// Local multer configuration removed in favor of Cloudinary

// POST /api/auth/new-joining (Joining Request - Case 3)
router.post('/new-joining', uploadCloud.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'aadhaarImage', maxCount: 1 }, // Front
    { name: 'aadhaarBackImage', maxCount: 1 }, // Back
    { name: 'panImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            fullName, fatherName, partnerName, dob, gender,
            mobile, email, address, hubName, aadhaar, pan,
            accountName, accountNumber, ifscCode, profileId, officeLocation
        } = req.body;

        if (!req.files?.['photo']?.[0]) {
            return res.status(400).json({ error: 'Selfie photo is mandatory for registration.' });
        }

        if (await User.findOne({ mobile })) {
            return res.status(400).json({ error: 'User with this mobile already exists.' });
        }

        // const hashedPassword = await bcrypt.hash('Pending123', 10); // Placeholder password

        // Create User with Pending Status
        const newUser = await User.create({
            fullName,
            fatherName,
            partnerName,
            dob: dob || undefined, // Normalize empty string to undefined for Date field
            gender,
            mobile,
            email,
            address,
            hubName,
            officeLocation,
            accountName,
            accountNumber,
            bankAccount: accountNumber || req.body.bankAccount, // Fallback/Sync
            ifscCode,
            profileId,
            aadhaar: (aadhaar && aadhaar.trim()) ? encrypt(aadhaar) : undefined,
            pan: (pan && pan.trim()) ? encrypt(pan) : undefined,
            photoUrl: req.files?.['photo']?.[0]?.path,
            aadhaarImage: req.files?.['aadhaarImage']?.[0]?.path,
            aadhaarBackImage: req.files?.['aadhaarBackImage']?.[0]?.path,
            panImage: req.files?.['panImage']?.[0]?.path,
            password: 'Pending123',
            role: 'pending',
            isApproved: false,
            isAccountActivated: false,
            isProfileCompleted: false,
            status: 'Pending'
        });

        const joiningRequest = await JoiningRequest.create({
            userId: newUser._id,
            fullName,
            mobile,
            email,
            hubName,
            photoUrl: newUser.photoUrl,
            aadhaar: aadhaar || '',
            pan: pan || '',
            accountName: accountName || '',
            accountNumber: accountNumber || '',
            bankAccount: accountNumber || req.body.bankAccount || '',
            ifscCode: ifscCode || '',
            profileId: profileId || '',
            officeLocation: officeLocation || '',
            dob: dob || undefined,
            gender: gender || 'Male',
            fatherName: fatherName || '',
            partnerName: partnerName || '',
            address: address || '',
            status: 'Pending'
        });

        // 🔵 REAL-TIME SYNC: Notify all Admins of New Request
        const { getIO } = require('../socket');
        try {
            const io = getIO();
            io.emit('new_joining_request', joiningRequest);
        } catch (sErr) { console.error('Socket broadcast failed:', sErr); }

        res.status(201).json({ message: 'Joining request submitted. Please wait for HR approval.' });

    } catch (error) {
        console.error('New joining error:', error);
        res.status(500).json({ error: 'Failed to submit request: ' + error.message });
    }
});

// POST /api/auth/register (Direct Registration - Case 2)
// POST /api/auth/admin/register (HR Admin Only - Secret Key Protected)
router.post('/admin/register', async (req, res) => {
    try {
        const { fullName, mobile, email, password, adminSecret } = req.body;

        // Verify Secret Key (In production, use ENV variable)
        const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'HR_ADMIN_2026';
        if (adminSecret !== SECRET_KEY) {
            return res.status(403).json({ error: 'Invalid Admin Secret Key. Access Denied.' });
        }

        if (await User.findOne({ mobile })) return res.status(400).json({ error: 'Mobile already registered' });

        // Generate Admin ID
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const employeeId = `ADMIN-${year}-${random}`;

        // const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName, mobile, email,
            password,
            employeeId,
            role: 'admin',      // Explicitly Admin
            isApproved: true,   // Auto-approved
            status: 'Active',
            designation: 'HR Administrator'
        });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ message: 'Admin registered successfully', token, user, employeeId });

    } catch (error) {
        console.error('Admin Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/register (Direct Registration - Case 2)
// Direct Registration Route
router.post('/register', uploadCloud.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'aadhaarBackImage', maxCount: 1 },
    { name: 'panImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            fullName, mobile, email, password, employeeId,
            hubName, aadhaar, pan, bankAccount, ifscCode, profileId, officeLocation, ehrId
        } = req.body;

        if (!req.files?.['photo']?.[0]) {
            return res.status(400).json({ error: 'Selfie photo is mandatory for registration.' });
        }

        if (await User.findOne({ mobile })) return res.status(400).json({ error: 'Mobile already registered' });
        if (employeeId && await User.findOne({ employeeId })) return res.status(400).json({ error: 'Employee ID already taken' });

        // Create User with Pending Status
        const user = await User.create({
            fullName,
            mobile,
            email,
            password,
            employeeId: employeeId || undefined,
            hubName,
            officeLocation,
            bankAccount,
            ifscCode,
            profileId,
            ehrId,
            aadhaar: (aadhaar && aadhaar.trim()) ? encrypt(aadhaar) : undefined,
            pan: (pan && pan.trim()) ? encrypt(pan) : undefined,
            baseRate: req.body.baseRate || 0,
            conveyance: req.body.conveyance || 0,
            photoUrl: req.files['photo']?.[0]?.path,
            aadhaarImage: req.files['aadhaarImage']?.[0]?.path,
            aadhaarBackImage: req.files['aadhaarBackImage']?.[0]?.path,
            panImage: req.files['panImage']?.[0]?.path,
            role: 'pending',
            isApproved: false,
            isAccountActivated: false,
            isProfileCompleted: false,
            isSelfRegistered: true, // User set their own password
            status: 'Pending'
        });

        // Create Joining Request Record (To show in Admin Panel)
        await JoiningRequest.create({
            userId: user._id,
            fullName,
            mobile,
            hubName,
            officeLocation,
            bankAccount,
            ifscCode,
            profileId,
            aadhaar: aadhaar || '',
            pan: pan || '',
            photoUrl: user.photoUrl,
            aadhaarImage: user.aadhaarImage,
            aadhaarBackImage: user.aadhaarBackImage,
            panImage: user.panImage,
            status: 'Pending'
        });

        // 🟢 REAL-TIME SYNC: Broadcast to admins
        const { getIO } = require('../socket');
        try {
            const io = getIO();
            io.emit('new_joining_request', {
                fullName,
                mobile,
                hubName,
                createdAt: new Date()
            });
            console.log('📡 Real-time notification emitted for new joining request');
        } catch (sErr) {
            console.error('Socket broadcast failed:', sErr);
        }

        res.status(201).json({
            message: 'Registration successful! Your access is PENDING ADMIN APPROVAL.',
            user: {
                fullName: user.fullName,
                mobile: user.mobile,
                employeeId: user.employeeId,
                status: 'Pending'
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
});

// GET /api/auth/me — Get current user profile
router.get('/me', authenticate, async (req, res) => {
    try {
        res.json({ user: req.user.toJSON() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get profile.' });
    }
});

// PUT /api/auth/me/profile — Update own profile
router.put('/me/profile', authenticate, async (req, res) => {
    try {
        const updates = { ...req.body };
        const allowedUpdates = [
            'fullName', 'email', 'mobile', 'address', 'partnerName',
            'hubName', 'bankAccount', 'ifscCode', 'aadhaar', 'pan'
        ];

        // Filter updates
        const filteredUpdates = {};
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) filteredUpdates[key] = updates[key];
        });

        filteredUpdates.isProfileCompleted = true; // Auto-complete on save

        const user = await User.findByIdAndUpdate(req.user.id, filteredUpdates, { new: true });
        res.json({ message: 'Profile updated successfully.', user: user.toJSON() });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
});

// POST /api/auth/forgot-password — Request OTP for password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ error: 'Mobile number is required.' });

        const user = await User.findOne({ mobile });
        if (!user) return res.status(404).json({ error: 'No account found with this mobile number.' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP temporarily for password reset
        global._resetOtpStore = global._resetOtpStore || {};
        global._resetOtpStore[mobile] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

        // Send via SMS service
        await sendOTP(mobile, otp);

        res.json({ message: 'Password reset OTP sent successfully.' });
    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ error: 'Failed to send OTP.' });
    }
});

// POST /api/auth/reset-password — Confirm OTP and reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { mobile, otp, newPassword } = req.body;
        if (!mobile || !otp || !newPassword) {
            return res.status(400).json({ error: 'Mobile, OTP and new password are required.' });
        }

        const stored = global._resetOtpStore?.[mobile];
        if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
            return res.status(401).json({ error: 'Invalid or expired OTP.' });
        }

        const user = await User.findOne({ mobile });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Update password (User model handles hashing)
        user.password = newPassword;
        await user.save();

        // Clear used OTP
        delete global._resetOtpStore[mobile];

        res.json({ message: 'Password reset successfully. You can now login with your new password.' });
    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ error: 'Failed to reset password.' });
    }
});

module.exports = router;
