require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const DailyReport = require('./models/DailyReport');
const PayoutReport = require('./models/PayoutReport');
const Payslip = require('./models/Payslip');

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const fhrId = 'FHR-001';
        const user = await User.findOne({ fhrId });

        if (!user) {
            console.error(`User ${fhrId} not found. Run master_seed.js first.`);
            process.exit(1);
        }

        console.log(`Seeding data for ${user.fullName} (${fhrId})`);

        // 1. Daily Reports (last 5 days)
        const dailyReports = [];
        for (let i = 1; i <= 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            dailyReports.push({
                fhrid: fhrId,
                full_name: user.fullName,
                hub_name: user.hubName || 'Delhi-NCR',
                ofd: 50 + i,
                ofp: 10,
                delivered: 45 + i,
                picked: 5,
                reportDate: date
            });
        }

        await DailyReport.deleteMany({ fhrid: fhrId });
        await DailyReport.insertMany(dailyReports);
        console.log('✅ 5 Daily Reports created.');

        // 2. Payout report (January 2026)
        const payout = {
            fhrid: fhrId,
            month: 1,
            year: 2026,
            profileId: user.profileId || 'PRF-001',
            full_name: user.fullName,
            hub_name: user.hubName || 'Delhi-NCR',
            accountNumber: user.bankAccount || '919293949596',
            ifscCode: user.ifscCode || 'IFSC0001234',
            workingDays: 25,
            totalAssigned: 1200,
            totalNormalDelivery: 1150,
            totalDeliveryCount: 1150,
            conversion: '95%',
            lmaBaseRate: 15,
            lmaBasePayAmt: 17250,
            tds: 172.5,
            finalBaseAmount: 17077.5,
            advance: 0,
            totalPayAmount: 17077.5,
            remark: 'Monthly performance bonus included'
        };

        await PayoutReport.deleteMany({ fhrid: fhrId, month: 1, year: 2026 });
        await new PayoutReport(payout).save();
        console.log('✅ Payout Report (Jan 2026) created.');

        // 3. Payslip (January 2026)
        const payslip = {
            fhrid: fhrId,
            month: 1,
            year: 2026,
            employeeName: user.fullName,
            designation: user.designation || 'Delivery Associate',
            doj: '01/01/2024',
            payPeriod: 'Jan 2026',
            paidDays: 25,
            lopDays: 2,
            basic: 15000,
            conveyance: 1000,
            incentives: 1500,
            otherAllowances: 500,
            grossEarnings: 18000,
            tds: 180,
            advance: 0,
            totalDeductions: 180,
            netPayable: 17820,
            pdfPath: 'https://example.com/payslip-jan-2026.pdf'
        };

        await Payslip.deleteMany({ fhrid: fhrId, month: 1, year: 2026 });
        await new Payslip(payslip).save();
        console.log('✅ Payslip (Jan 2026) created.');

        console.log('\n--- SUCCESS ---');
        console.log(`User ${fhrId} (emp123) now has:`);
        console.log('- 5 Daily Reports');
        console.log('- 1 Payout Report');
        console.log('- 1 Payslip');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedData();
