const express = require('express');
const router = express.Router();
const AdvanceRequest = require('../models/AdvanceRequest');
const Notification = require('../models/Notification');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { uploadCloud } = require('../services/cloudinary');

// POST /api/advance-requests — Employee submits
router.post('/', authenticate, uploadCloud.single('qrCode'), async (req, res) => {
    try {
        const { amount, reason, dateRequired, currentSalary, pendingAdvance, hubName, email, partnerName, profileId, phone } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required.' });
        }

        const request = await AdvanceRequest.create({
            userId: req.user._id,
            amount,
            reason,
            dateRequired,
            currentSalary,
            pendingAdvance,
            hubName,
            email,
            partnerName,
            profileId,
            phone,
            qrCodeUrl: req.file ? req.file.path : null,
        });

        // Notify admins
        const User = require('../models/User');
        const { sendNotification } = require('../services/notificationService');
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await sendNotification(
                admin._id,
                'New Advance Request',
                `${req.user.fullName} requested an advance of ₹${amount}.`
            );
        }

        res.status(201).json({ message: 'Advance request submitted.', request });
    } catch (error) {
        console.error('Advance request error:', error);
        res.status(500).json({ error: error.message || 'Failed to submit advance request.' });
    }
});

// GET /api/advance-requests — Admin gets all; Employee gets own
router.get('/', authenticate, async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'employee') {
            filter.userId = req.user._id;
        }
        if (req.query.status) filter.status = req.query.status;

        const requests = await AdvanceRequest.find(filter)
            .populate('userId', 'fullName employeeId')
            .sort({ createdAt: -1 });

        res.json({ requests });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch advance requests.' });
    }
});

// PUT /api/advance-requests/:id — Admin approves/rejects
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { status, adminRemarks } = req.body;
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be Approved or Rejected.' });
        }

        const request = await AdvanceRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found.' });

        request.status = status;
        request.adminRemarks = adminRemarks;
        if (status === 'Approved') request.approvedAt = new Date();
        await request.save();

        // Notify employee
        const { sendNotification } = require('../services/notificationService');
        await sendNotification(
            request.userId,
            `Advance Request ${status}`,
            `Your advance request of ₹${request.amount} has been ${status.toLowerCase()}.${adminRemarks ? ' Remarks: ' + adminRemarks : ''}`
        );

        res.json({ message: `Advance request ${status.toLowerCase()}.`, request });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update advance request.' });
    }
});

module.exports = router;
