const mongoose = require('mongoose');
const User = require('./models/User');
const DailyReport = require('./models/DailyReport');
const Payslip = require('./models/Payslip');
require('dotenv').config();

async function debugData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Find User "gouriya"
        const users = await User.find({ fullName: /gouriya/i });
        console.log(`Found ${users.length} users matching 'gouriya'`);
        users.forEach(u => {
            console.log(`User: ${u.fullName} | ID: ${u._id} | ehrId: ${u.ehrId} | Mobile: ${u.mobile} | Email: ${u.email}`);
        });

        if (users.length === 0) {
            console.log("No user found with name 'gouriya'. Listing all users:");
            const allUsers = await User.find({}, 'fullName mobile ehrId');
            allUsers.forEach(u => console.log(`- ${u.fullName} (${u.mobile})`));
        }

        const targetUser = users[0];
        if (targetUser) {
            // 2. Check Daily Reports for this user
            const reports = await DailyReport.find({ employeeId: targetUser._id });
            console.log(`\nDaily Reports for ${targetUser.fullName} (Count: ${reports.length}):`);
            reports.forEach(r => {
                console.log(`- Date: ${r.reportDate} | OFD: ${r.ofd} | Delivered: ${r.delivered}`);
            });

            // 3. Check for ORPHANED reports (reports with ehrId matching user but not linked? Impossible with current Schema logic, but let's check text match)
            if (targetUser.ehrId) {
                const orphaned = await DailyReport.find({ ehrId: targetUser.ehrId, employeeId: { $ne: targetUser._id } });
                console.log(`\nOrphaned reports matching ehrId '${targetUser.ehrId}': ${orphaned.length}`);
            }

            // 4. Check Payslips
            const payslips = await Payslip.find({ userId: targetUser._id });
            console.log(`\nPayslips for ${targetUser.fullName} (Count: ${payslips.length}):`);
            payslips.forEach(p => {
                console.log(`- ${p.month}/${p.year} | Net: ${p.netPayable}`);
            });
        }

        // 5. List ALL Daily Reports (last 5) to see what's in there
        const allReports = await DailyReport.find().sort({ createdAt: -1 }).limit(5).populate('employeeId', 'fullName');
        console.log('\nLatest 5 Daily Reports in System:');
        allReports.forEach(r => {
            console.log(`- Date: ${r.reportDate} | Employee: ${r.employeeId?.fullName || 'Unlinked'} | ID in Report: ${r.employeeId?._id}`);
        });

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debugData();
