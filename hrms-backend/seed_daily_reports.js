const mongoose = require('mongoose');
const DailyReport = require('./models/DailyReport');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

const seedDailyReports = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testFhrids = ['TEST-001', 'TEST-002', 'TEST-003'];
        const reportDate = new Date();
        reportDate.setHours(0, 0, 0, 0);

        const formattedDate = reportDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

        for (const fhrid of testFhrids) {
            const user = await User.findOne({ fhrId: fhrid });
            if (!user) {
                console.warn(`User ${fhrid} not found, skipping...`);
                continue;
            }

            // 1. Create Daily Report
            const reportData = {
                fhrid: fhrid,
                full_name: user.fullName,
                hub_name: user.hubName || 'BALLIAHUB_BLA',
                ofd: Math.floor(Math.random() * 20) + 40, // 40-60
                ofp: Math.floor(Math.random() * 10) + 5,   // 5-15
                delivered: Math.floor(Math.random() * 20) + 35, // 35-55
                picked: Math.floor(Math.random() * 5) + 5,      // 5-10
                reportDate: reportDate
            };

            await DailyReport.findOneAndUpdate(
                { fhrid, reportDate },
                reportData,
                { upsert: true, new: true }
            );

            // 2. Create Notification (to trigger pop-up)
            await Notification.create({
                userId: user._id,
                title: 'New Daily Performance Report',
                message: `Your performance report for ${formattedDate} has been uploaded. DEL: ${reportData.delivered}, OFD: ${reportData.ofd}.`,
                isRead: false
            });

            console.log(`✅ Seeded Daily Report and Notification for ${fhrid}`);
        }

        console.log('\n--- SEED COMPLETE ---');
        console.log('Test users can now log in to see the real-time pop-up.');
        process.exit(0);
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seedDailyReports();
