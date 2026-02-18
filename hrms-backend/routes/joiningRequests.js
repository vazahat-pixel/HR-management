const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const JoiningRequest = require('../models/JoiningRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { encrypt } = require('../middleware/encrypt');
const { sendEmail } = require('../services/emailService');

// GET /api/joining-requests — Admin gets all requests
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const requests = await JoiningRequest.find(filter).sort({ createdAt: -1 });
        res.json({ requests });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch joining requests.' });
    }
});

// PUT /api/joining-requests/:id/approve — Approve and create/update user
router.put('/:id/approve', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { customEmployeeId, customPassword, sendEmail: shouldSendEmail } = req.body;
        const request = await JoiningRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found.' });
        if (request.status !== 'Pending') return res.status(400).json({ error: 'Request already processed.' });

        let user;
        let employeeId;
        const year = new Date().getFullYear();

        // Credentials Logic
        const generatedPassword = crypto.randomBytes(4).toString('hex') + 'A1!';
        let finalPassword = customPassword && customPassword.trim() ? customPassword.trim() : generatedPassword;

        // ID Logic
        if (customEmployeeId && customEmployeeId.trim()) {
            employeeId = customEmployeeId.trim();
            // Check uniqueness if custom ID provided
            if (await User.findOne({ employeeId })) {
                return res.status(400).json({ error: `Employee ID ${employeeId} is already taken.` });
            }
        } else {
            const count = await User.countDocuments({ employeeId: { $regex: /^EMP-/ } });
            employeeId = `EMP-${year}-${String(count + 1).padStart(3, '0')}`;
        }

        if (request.userId) {
            // Update existing pending user
            user = await User.findById(request.userId);
            if (user) {
                // If user self-registered, they might already have an ID or password
                if (!user.employeeId) user.employeeId = employeeId;

                // If Admin provided a custom password, override it.
                // If not, and user self-registered, keep theirs.
                // If not self-registered and no custom password, generate new.
                if (customPassword && customPassword.trim()) {
                    user.password = finalPassword;
                    user.isSelfRegistered = false; // Admin took control
                } else if (!user.isSelfRegistered) {
                    user.password = finalPassword;
                }
                // If user IS self-registered and admin didn't provide password, we keep user's existing password.
                // So finalPassword variable might be misleading here if we don't update it to match user's actual password for the email.
                // But we can't retrieve user's hashed password. 
                // So if isSelfRegistered is true and no custom password, we send "Use your existing password" in email.

                user.role = 'employee';
                user.status = 'Active';
                user.isApproved = true;
                user.isAccountActivated = true;
                user.joiningDate = new Date();
                user.officeLocation = user.officeLocation || request.officeLocation;
                user.hubName = user.hubName || request.hubName;
                user.bankAccount = user.bankAccount || request.bankAccount;
                user.accountName = user.accountName || request.accountName;
                user.accountNumber = user.accountNumber || request.accountNumber;
                user.ifscCode = user.ifscCode || request.ifscCode;
                user.profileId = user.profileId || request.profileId;

                // Securely encrypt and transfer identity documents
                if (!user.aadhaar && request.aadhaar) user.aadhaar = encrypt(request.aadhaar);
                if (!user.pan && request.pan) user.pan = encrypt(request.pan);
                if (!user.photoUrl && request.photoUrl) user.photoUrl = request.photoUrl;
                if (!user.aadhaarImage && request.aadhaarImage) user.aadhaarImage = request.aadhaarImage;
                if (!user.aadhaarBackImage && request.aadhaarBackImage) user.aadhaarBackImage = request.aadhaarBackImage;
                if (!user.panImage && request.panImage) user.panImage = request.panImage;

                await user.save();
            }
        }

        if (!user) {
            // Create new user
            user = await User.create({
                fullName: request.fullName,
                employeeId,
                mobile: request.mobile,
                email: request.email,
                password: finalPassword,
                officeLocation: request.officeLocation,
                hubName: request.hubName,
                partnerName: request.partnerName,
                fatherName: request.fatherName,
                dob: request.dob,
                gender: request.gender,
                address: request.address,
                bankAccount: request.bankAccount,
                accountName: request.accountName,
                accountNumber: request.accountNumber,
                ifscCode: request.ifscCode,
                profileId: request.profileId,
                aadhaar: request.aadhaar ? encrypt(request.aadhaar) : undefined,
                pan: request.pan ? encrypt(request.pan) : undefined,
                photoUrl: request.photoUrl,
                aadhaarImage: request.aadhaarImage,
                aadhaarBackImage: request.aadhaarBackImage,
                panImage: request.panImage,
                role: 'employee',
                status: 'Active',
                isApproved: true,
                isAccountActivated: true,
                isSelfRegistered: false,
                joiningDate: new Date()
            });
        }

        request.status = 'Approved';
        request.adminRemarks = req.body.remarks || 'Approved';
        await request.save();

        console.log(`User approved: ${user.fullName} (${user.employeeId})`);

        // Send Email if requested (Default to true if undefined, but explicit false checks)
        if (shouldSendEmail !== false) {
            try {
                const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173/auth/login';
                const passwordDisplay = (user.isSelfRegistered && !customPassword) ? '(Your existing password)' : finalPassword;

                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #059669;">Welcome to Angle Courier!</h2>
                        <p>Your account has been approved and activated.</p>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Employee ID:</strong> ${user.employeeId}</p>
                            <p><strong>Password:</strong> ${passwordDisplay}</p>
                        </div>
                        <p>Please login and complete your profile immediately:</p>
                        <a href="${loginUrl}" style="display: inline-block; background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Portal</a>
                        <p style="margin-top: 20px; font-size: 12px; color: #666;">If the button doesn't work, copy this link: ${loginUrl}</p>
                    </div>
                `;

                if (user.email) {
                    await sendEmail({
                        to: user.email,
                        subject: 'Your HRMS Login Credentials',
                        html: emailHtml
                    });
                }
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
            }
        }

        res.json({
            message: 'Joining request approved. Employee activated.',
            employee: user.toJSON(),
            tempPassword: (user.isSelfRegistered && !customPassword) ? null : finalPassword,
        });
    } catch (error) {
        console.error('Approve joining error:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/joining-requests/:id/reject — Reject request
router.put('/:id/reject', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const request = await JoiningRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found.' });
        if (request.status !== 'Pending') return res.status(400).json({ error: 'Request already processed.' });

        request.status = 'Rejected';
        request.adminRemarks = req.body.remarks || 'Rejected';
        await request.save();

        res.json({ message: 'Joining request rejected.', request });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject request.' });
    }
});

// GET /api/joining-requests/export/excel — Export to Excel
router.get('/export/excel', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Joining Requests');

        worksheet.columns = [
            { header: 'Full Name', key: 'fullName', width: 20 },
            { header: 'Mobile', key: 'mobile', width: 15 },
            { header: 'Status', key: 'status', width: 10 },
            { header: 'Date', key: 'createdAt', width: 20 },
            { header: 'Father Name', key: 'fatherName', width: 20 },
            { header: 'Address', key: 'address', width: 30 },
            { header: 'Hub Name', key: 'hubName', width: 15 },
            { header: 'Aadhaar', key: 'aadhaar', width: 15 },
            { header: 'PAN', key: 'pan', width: 15 },
        ];

        const requests = await JoiningRequest.find().sort({ createdAt: -1 });

        requests.forEach(req => {
            worksheet.addRow({
                fullName: req.fullName,
                mobile: req.mobile,
                status: req.status,
                createdAt: req.createdAt.toLocaleString(),
                fatherName: req.fatherName,
                address: req.address,
                hubName: req.hubName,
                aadhaar: req.aadhaar,
                pan: req.pan
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=JoiningRequests.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export to Excel.' });
    }
});

module.exports = router;
