const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications — User's notifications
router.get('/', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const total = await Notification.countDocuments({ userId: req.user._id });
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({ notifications, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
});

// GET /api/notifications/unread-count
router.get('/unread-count', authenticate, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get unread count.' });
    }
});

// PUT /api/notifications/:id/read — Mark single as read
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ error: 'Notification not found.' });
        res.json({ notification });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as read.' });
    }
});

// PUT /api/notifications/read-all — Mark all as read
router.put('/read-all', authenticate, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark all as read.' });
    }
});

// POST /api/notifications/fcm-token — Save FCM token
router.post('/fcm-token', authenticate, async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required.' });

        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, { fcmToken: token });
        res.json({ message: 'FCM token updated.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update FCM token.' });
    }
});

module.exports = router;
