const mongoose = require('mongoose');
require('dotenv').config();

async function cleanIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const payslipsExists = collections.some(c => c.name === 'payslips');
        const payoutreportsExists = collections.some(c => c.name === 'payoutreports');

        if (payslipsExists) {
            console.log('Dropping legacy indexes from payslips...');
            try {
                await mongoose.connection.db.collection('payslips').dropIndexes();
                console.log('✅ Payslips indexes dropped.');
            } catch (e) {
                console.warn('Payslips collection index drop skipped or empty.');
            }
        }

        if (payoutreportsExists) {
            console.log('Dropping legacy indexes from payoutreports...');
            try {
                await mongoose.connection.db.collection('payoutreports').dropIndexes();
                console.log('✅ Payoutreports indexes dropped.');
            } catch (e) {
                console.warn('Payoutreports collection index drop skipped or empty.');
            }
        }

        console.log('Re-syncing correct indexes...');
        const Payslip = require('./models/Payslip');
        const PayoutReport = require('./models/PayoutReport');

        await Promise.all([
            Payslip.createIndexes(),
            PayoutReport.createIndexes()
        ]);

        console.log('✅ Correct indexes synchronized.');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

cleanIndexes();
