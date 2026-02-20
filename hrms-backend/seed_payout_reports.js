const mongoose = require('mongoose');
const PayoutReport = require('./models/PayoutReport');
const User = require('./models/User');
require('dotenv').config();

const seedDetailedPayouts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testUsers = ['TEST-001', 'TEST-002', 'TEST-003'];
        const month = 2; // February
        const year = 2026;

        // Clear existing for this period
        await PayoutReport.deleteMany({ month, year, fhrid: { $in: testUsers } });

        const sampleData = [
            {
                fhrid: 'TEST-001',
                month, year,
                full_name: 'Rahul Sharma [TEST-001]',
                profileId: 'WM001',
                hub_name: 'DELHI_SOUTH_HUB',
                accountNumber: '91827364510',
                ifscCode: 'HDFC0001234',
                workingDays: 26,
                totalAssigned: 1200,
                totalNormalDelivery: 1050,
                sopsyDelivered: 50,
                gtnlDelivered: 30,
                u2sShipment: 20,
                totalDeliveryCount: 1150,
                conversion: '95.8%',
                lmaBaseRate: 15,
                finalBasePayAmt: 17250,
                tds: 172.5,
                advance: 1500,
                totalPayAmount: 15577.5,
                remark: 'High performance bonus included'
            },
            {
                fhrid: 'TEST-002',
                month, year,
                full_name: 'Anjali Gupta [TEST-002]',
                profileId: 'WM002',
                hub_name: 'DELHI_WEST_HUB',
                accountNumber: '1029384756',
                ifscCode: 'ICIC0005678',
                workingDays: 24,
                totalAssigned: 1000,
                totalNormalDelivery: 800,
                sopsyDelivered: 40,
                gtnlDelivered: 20,
                u2sShipment: 10,
                totalDeliveryCount: 870,
                conversion: '87%',
                lmaBaseRate: 14,
                finalBasePayAmt: 12180,
                tds: 121.8,
                advance: 0,
                totalPayAmount: 12058.2,
                remark: 'Standard payout'
            },
            {
                fhrid: 'TEST-003',
                month, year,
                full_name: 'Vikram Singh [TEST-003]',
                profileId: 'WM003',
                hub_name: 'DELHI_NORTH_HUB',
                accountNumber: '5544332211',
                ifscCode: 'SBIN0009988',
                workingDays: 25,
                totalAssigned: 1100,
                totalNormalDelivery: 900,
                sopsyDelivered: 60,
                gtnlDelivered: 40,
                u2sShipment: 30,
                totalDeliveryCount: 1030,
                conversion: '93.6%',
                lmaBaseRate: 16,
                finalBasePayAmt: 16480,
                tds: 164.8,
                advance: 500,
                totalPayAmount: 15815.2,
                remark: 'Deduction for early advance'
            }
        ];

        await PayoutReport.insertMany(sampleData);
        console.log('Successfully seeded detailed payout records for 3 test users.');
        process.exit(0);
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seedDetailedPayouts();
