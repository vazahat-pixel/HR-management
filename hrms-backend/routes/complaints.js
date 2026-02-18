const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { uploadCloud } = require('../services/cloudinary');

// POST /api/complaints — Employee submits
router.post('/', authenticate, uploadCloud.single('attachment'), async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) return res.status(400).json({ error: 'Subject and message are required.' });

        const complaint = await Complaint.create({
            userId: req.user._id,
            subject,
            message,
            attachmentUrl: req.file ? req.file.path : null,
        });

        // Notify admins
        const User = require('../models/User');
        const { sendNotification } = require('../services/notificationService');
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await sendNotification(
                admin._id,
                'New Complaint',
                `${req.user.fullName} submitted a complaint: "${subject}"`
            );
        }

        res.status(201).json({ message: 'Complaint submitted.', complaint });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit complaint.' });
    }
});

// GET /api/complaints — Admin gets all; Employee gets own
router.get('/', authenticate, async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'employee') {
            filter.userId = req.user._id;
        }
        if (req.query.status) filter.status = req.query.status;

        const complaints = await Complaint.find(filter)
            .populate('userId', 'fullName employeeId')
            .sort({ createdAt: -1 });

        res.json({ complaints });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaints.' });
    }
});

// PUT /api/complaints/:id — Admin updates status + replies
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { status, adminReply } = req.body;
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

        if (status) complaint.status = status;
        if (adminReply) {
            complaint.adminReply = adminReply;
            complaint.repliedAt = new Date();
        }
        await complaint.save();

        // Notify employee
        const { sendNotification } = require('../services/notificationService');
        await sendNotification(
            complaint.userId,
            'Complaint Update',
            `Your complaint "${complaint.subject}" has been updated to: ${complaint.status}.${adminReply ? ' Reply: ' + adminReply : ''}`
        );

        res.json({ message: 'Complaint updated.', complaint });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update complaint.' });
    }
});

module.exports = router;
