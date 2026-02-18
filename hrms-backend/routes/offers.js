const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// POST /api/offers — Admin creates offer + notifies all employees
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const { title, description, discount, provider, validUntil, eligibilityCriteria } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required.' });

        const offer = await Offer.create({
            title,
            description,
            discount,
            provider,
            validUntil,
            eligibilityCriteria,
            createdBy: req.user._id,
        });

        // Notify all employees
        const { sendNotification } = require('../services/notificationService');
        const employees = await User.find({ role: 'employee', status: 'Active' });
        for (const emp of employees) {
            await sendNotification(
                emp._id,
                '🎉 New Offer Available!',
                `${title} — ${description || discount || 'Check it out!'}`
            );
        }

        res.status(201).json({ message: 'Offer created and employees notified.', offer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create offer.' });
    }
});

// GET /api/offers — Get all active offers
router.get('/', authenticate, async (req, res) => {
    try {
        const filter = { isActive: true };
        if (req.query.all === 'true' && req.user.role === 'admin') {
            delete filter.isActive;
        }

        const offers = await Offer.find(filter).sort({ createdAt: -1 });
        res.json({ offers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch offers.' });
    }
});

// PUT /api/offers/:id — Admin updates offer
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!offer) return res.status(404).json({ error: 'Offer not found.' });
        res.json({ message: 'Offer updated.', offer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update offer.' });
    }
});

// DELETE /api/offers/:id — Admin deactivates offer
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!offer) return res.status(404).json({ error: 'Offer not found.' });
        res.json({ message: 'Offer deactivated.', offer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to deactivate offer.' });
    }
});

module.exports = router;
