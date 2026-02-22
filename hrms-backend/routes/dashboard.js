const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payslip = require('../models/Payslip');
const AdvanceRequest = require('../models/AdvanceRequest');
const Complaint = require('../models/Complaint');
const Offer = require('../models/Offer');
const DailyReport = require('../models/DailyReport');
const Notification = require('../models/Notification');
const JoiningRequest = require('../models/JoiningRequest');
const { authenticate } = require('../middleware/auth');

// GET /api/dashboard/admin — Aggregate stats
router.get('/admin', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });

        const totalEmployees = await User.countDocuments({ role: 'employee' });
        const activeEmployees = await User.countDocuments({ role: 'employee', status: 'Active' });
        const pendingJoining = await JoiningRequest.countDocuments({ status: 'Pending' });
        const pendingAdvances = await AdvanceRequest.countDocuments({ status: 'Pending' });
        const openComplaints = await Complaint.countDocuments({ status: { $in: ['Open', 'In Progress'] } });
        const activeOffers = await Offer.countDocuments({ isActive: true });

        // Get current month payroll total
        const now = new Date();
        const payslips = await Payslip.find({ month: now.getMonth() + 1, year: now.getFullYear() });
        const payrollProcessed = payslips.reduce((sum, p) => sum + (p.netPayable || 0), 0);

        // Today's reports
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayReports = await DailyReport.countDocuments({ reportDate: { $gte: today } });

        // Recent activity
        const recentNotifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 }).limit(5);

        res.json({
            totalEmployees,
            activeEmployees,
            pendingJoining,
            pendingAdvances,
            openComplaints,
            activeOffers,
            payrollProcessed,
            todayReports,
            recentNotifications,
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard.' });
    }
});

// GET /api/dashboard/employee — Employee's own stats
router.get('/employee', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;

        // Latest payslip
        const latestPayslip = await Payslip.findOne({ fhrid: req.user.fhrId }).sort({ year: -1, month: -1 });

        // Pending advance requests
        const pendingAdvances = await AdvanceRequest.countDocuments({ userId, status: 'Pending' });
        const approvedAdvances = await AdvanceRequest.find({ userId, status: 'Approved' }).sort({ createdAt: -1 }).limit(3);

        // Complaints
        const openComplaints = await Complaint.countDocuments({ userId, status: { $in: ['Open', 'In Progress'] } });

        // Latest report (not necessarily today, but the most recent one)
        const latestDailyReport = await DailyReport.findOne({ fhrid: req.user.fhrId })
            .sort({ reportDate: -1 });

        // This month's working days
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthReports = await DailyReport.countDocuments({
            fhrid: req.user.fhrId,
            reportDate: { $gte: monthStart, $lte: now }
        });

        // Recent notifications
        const recentNotifications = await Notification.find({ userId })
            .sort({ createdAt: -1 }).limit(5);

        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        res.json({
            user: req.user.toJSON(),
            latestPayslip,
            pendingAdvances,
            approvedAdvances,
            openComplaints,
            todayReport: latestDailyReport, // Passing the full object now
            monthWorkingDays: monthReports,
            recentNotifications,
            unreadNotifications: unreadCount,
        });
    } catch (error) {
        console.error('Employee dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard.' });
    }
});

module.exports = router;
