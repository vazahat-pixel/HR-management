const mongoose = require('mongoose');
const Payslip = require('./models/Payslip');
const pdfService = require('./services/pdfService');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function regenerateAll() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const slips = await Payslip.find({});
        console.log(`Found ${slips.length} salary slips to regenerate.`);

        for (let i = 0; i < slips.length; i++) {
            const slip = slips[i];
            console.log(`[${i + 1}/${slips.length}] Regenerating PDF for ${slip.employeeName} (${slip.fhrid})...`);

            try {
                // Generate new PDF using the updated service (which includes the logo)
                const newPdfPath = await pdfService.generateSalarySlip(slip);

                // Update the database with the new path
                slip.pdfPath = newPdfPath;
                await slip.save();

                console.log(`   - Success: ${newPdfPath}`);
            } catch (err) {
                console.error(`   - Failed for ${slip.fhrid}:`, err.message);
            }
        }

        console.log('\nAll existing salary slips have been regenerated with the new format and logo.');
        process.exit(0);
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
}

regenerateAll();
