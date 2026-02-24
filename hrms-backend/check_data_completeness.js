require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const DailyReport = require('./models/DailyReport');
const PayoutReport = require('./models/PayoutReport');
const Payslip = require('./models/Payslip');

async function findCompleteUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'employee' });
        console.log(`Checking ${users.length} employees...\n`);

        const results = [];

        for (const user of users) {
            const [dailyCount, payoutCount, payslipCount] = await Promise.all([
                DailyReport.countDocuments({ userId: user._id }),
                PayoutReport.countDocuments({ userId: user._id }),
                Payslip.countDocuments({ userId: user._id })
            ]);

            if (dailyCount > 0 || payoutCount > 0 || payslipCount > 0) {
                results.push({
                    id: user.fhrId || user.employeeId,
                    name: user.fullName,
                    daily: dailyCount,
                    payout: payoutCount,
                    payslip: payslipCount
                });
            }
        }

        // Sort by total data points
        results.sort((a, b) => (b.daily + b.payout + b.payslip) - (a.daily + a.payout + a.payslip));

        console.log('--- EMPLOYEES WITH DATA ---');
        console.log('ID | Name | Daily | Payout | Payslip');
        results.forEach(r => {
            console.log(`${r.id} | ${r.name} | ${r.daily} | ${r.payout} | ${r.payslip}`);
        });

        if (results.length === 0) {
            console.log('No employees found with any report data.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

findCompleteUser();
