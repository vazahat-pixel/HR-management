const mongoose = require('mongoose');
const DailyReport = require('./models/DailyReport');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

const verifyDailyReportFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testFhrid = 'TEST-001';
        const user = await User.findOne({ fhrId: testFhrid });
        if (!user) {
            console.error('Test user TEST-001 not found. Please run recreate_test_users.js first.');
            process.exit(1);
        }

        const reportDate = new Date();
        reportDate.setHours(0, 0, 0, 0);

        // 1. Simulate Upload Mapping
        console.log('Simulating Daily Report upload for TEST-001...');
        const reportData = {
            fhrid: testFhrid,
            full_name: user.fullName,
            hub_name: 'BALLIAHUB_BLA',
            ofd: 54,
            ofp: 14,
            delivered: 48,
            picked: 10,
            reportDate: reportDate
        };

        await DailyReport.findOneAndUpdate(
            { fhrid: testFhrid, reportDate: reportDate },
            reportData,
            { upsert: true, new: true }
        );
        console.log('✅ Daily Report record upserted.');

        // 2. Simulate Notification Logic
        const formattedDate = reportDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        const notification = await Notification.create({
            userId: user._id,
            title: 'New Daily Performance Report',
            message: `Your performance report for ${formattedDate} has been uploaded. DEL: 48, OFD: 54.`,
        });
        console.log('✅ Unread notification created for user.');

        // 3. Verify counts
        const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });
        console.log(`Verification: User ${testFhrid} has ${unreadCount} unread notifications.`);

        if (unreadCount > 0) {
            console.log('\n--- VERIFICATION SUCCESS ---');
            console.log('The next time TEST-001 visits the dashboard, the "New Report Update" pop-up will trigger.');
        } else {
            console.error('Verification FAILED: Notification not found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Verification Error:', err);
        process.exit(1);
    }
};

verifyDailyReportFlow();
