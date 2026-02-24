const pdfService = require('./services/pdfService');
const fs = require('fs');
const path = require('path');

const sampleData = {
    fhrid: 'TEST-001',
    month: 9,
    year: 2025,
    employeeName: 'Vinay Kumar',
    designation: 'Delivery boy',
    doj: '8/1/2025',
    payDate: '10/15/2025',
    accountNumber: '1879000100391210',
    ifscCode: 'PUNB0187900',
    paidDays: 28,
    lopDays: 3,
    basic: 9420.00,
    conveyance: 0.00,
    incentives: 0.00,
    otherAllowances: 0.00,
    grossEarnings: 9420.00,
    tds: 0.00,
    advance: 5122.00,
    otherDeductions: 0.00,
    totalDeductions: 5122.00,
    netPayable: 4298.00
};

async function test() {
    try {
        console.log('Generating test salary slip...');
        const filePath = await pdfService.generateSalarySlip(sampleData);
        console.log('PDF generated at:', filePath);

        // Check if file exists
        if (fs.existsSync(filePath)) {
            console.log('SUCCESS: File exists.');
        } else {
            console.log('FAILURE: File does not exist.');
        }
    } catch (err) {
        console.error('ERROR:', err);
    }
}

test();
