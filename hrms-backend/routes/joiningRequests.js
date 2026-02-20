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

        // FHRID Logic
        let fhrId = customEmployeeId && customEmployeeId.trim() ? customEmployeeId.trim() : null;

        if (fhrId) {
            // Check uniqueness if custom FHRID provided
            const existingUser = await User.findOne({ fhrId });
            if (existingUser) {
                return res.status(400).json({ error: `FHRID ${fhrId} is already taken by ${existingUser.fullName}.` });
            }
        } else {
            // Auto-generate FHRID if not provided
            const count = await User.countDocuments({ fhrId: { $regex: /^FHR-/ } });
            fhrId = `FHR-${year}-${String(count + 1).padStart(3, '0')}`;
        }

        // employeeId backup (redundant but keeping context)
        employeeId = fhrId;

        if (request.userId) {
            // Update existing pending user
            user = await User.findById(request.userId);
            if (user) {
                console.log(`Updating existing user: ${user.fullName} (ID: ${user._id})`);
                console.log(`Setting FHRID: ${fhrId}`);

                // Explicitly set fields
                user.fhrId = fhrId;
                user.employeeId = fhrId; // Keep in sync
                user.password = finalPassword;
                user.isSelfRegistered = false;

                user.role = 'employee';
                user.status = 'Active';
                user.isApproved = true;
                user.isAccountActivated = true;
                user.joiningDate = new Date();

                // Transfer request data
                user.officeLocation = request.officeLocation || user.officeLocation;
                user.hubName = request.hubName || user.hubName;
                user.bankAccount = request.bankAccount || user.bankAccount;
                user.accountName = request.accountName || user.accountName;
                user.accountNumber = request.accountNumber || user.accountNumber;
                user.ifscCode = request.ifscCode || user.ifscCode;
                user.profileId = request.profileId || user.profileId;

                // Securely transfer identity docs
                if (request.aadhaar) user.aadhaar = encrypt(request.aadhaar);
                if (request.pan) user.pan = encrypt(request.pan);
                if (request.photoUrl) user.photoUrl = request.photoUrl;
                if (request.aadhaarImage) user.aadhaarImage = request.aadhaarImage;
                if (request.aadhaarBackImage) user.aadhaarBackImage = request.aadhaarBackImage;
                if (request.panImage) user.panImage = request.panImage;

                await user.save();
                console.log(`User saved successfully. DB FHRID: ${user.fhrId}`);
            }
        }

        if (!user) {
            console.log(`Creating new user for request: ${request.fullName}`);
            // Create new user if no userId exists in request
            user = await User.create({
                fullName: request.fullName,
                fhrId: fhrId,
                employeeId: fhrId,
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
            console.log(`New user created with FHRID: ${user.fhrId}`);
        }

        request.status = 'Approved';
        request.adminRemarks = req.body.remarks || 'Approved';
        await request.save();

        // 🟢 REAL-TIME SYNC: Broadcast to other admins
        const { getIO } = require('../socket');
        try {
            const io = getIO();
            io.emit('joining_request_updated', {
                id: request._id,
                status: 'Approved',
                fullName: request.fullName,
                fhrId: user.fhrId,
                employeeId: user.employeeId
            });
        } catch (sErr) { console.error('Socket broadcast failed:', sErr); }

        console.log(`User approved: ${user.fullName} (FHRID: ${user.fhrId})`);

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
                            <p><strong>Employee FHRID:</strong> ${user.fhrId}</p>
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
            fhrId: user.fhrId,
            employeeId: user.employeeId,
            tempPassword: (user.isSelfRegistered && !customPassword) ? null : finalPassword,
        });
    } catch (error) {
        console.error('Approve joining error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/joining-requests/send-credentials — Send credentials via email
router.post('/send-credentials', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { email, employeeId, password, fullName } = req.body;
        if (!email || !employeeId || !password) {
            return res.status(400).json({ error: 'Incomplete credential data.' });
        }

        const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173/auth/login';

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #C46A2D; margin: 0;">Angle Courier</h1>
                    <p style="color: #666; font-size: 14px; margin-top: 5px;">HR Management System</p>
                </div>
                <h2 style="color: #1e293b; font-size: 20px;">Welcome to the Team, ${fullName}!</h2>
                <p>Your official account has been successfully created and activated. You can now access the HRMS portal using the credentials below:</p>
                
                <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Login Credentials</p>
                    <p style="margin: 0 0 5px 0; font-size: 16px;"><strong>Employee ID:</strong> <span style="color: #C46A2D; font-family: monospace;">${employeeId}</span></p>
                    <p style="margin: 0; font-size: 16px;"><strong>Password:</strong> <span style="color: #C46A2D; font-family: monospace;">${password}</span></p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${loginUrl}" style="display: inline-block; background: #1e293b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Access Employee Portal</a>
                </div>

                <hr style="margin: 40px 0 20px 0; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                    This is an automated message. Please do not reply to this email.<br/>
                    For technical support, contact the IT department.
                </p>
            </div>
        `;

        await sendEmail({
            to: email,
            subject: 'Official Login Credentials - Angle Courier',
            html: emailHtml
        });

        res.json({ message: 'Credentials sent successfully to ' + email });
    } catch (error) {
        console.error('Send credentials error:', error);
        res.status(500).json({
            error: 'Failed to send email.',
            details: error.message,
            code: error.code // To identify if it is EAUTH, ESOCKET, etc.
        });
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

        // 🔴 REAL-TIME SYNC: Broadcast to other admins
        const { getIO } = require('../socket');
        try {
            const io = getIO();
            io.emit('joining_request_updated', {
                id: request._id,
                status: 'Rejected',
                fullName: request.fullName
            });
        } catch (sErr) { console.error('Socket broadcast failed:', sErr); }

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
