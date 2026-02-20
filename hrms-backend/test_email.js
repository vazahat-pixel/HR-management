require('dotenv').config();
const { sendEmail } = require('./services/emailService');

async function testEmail() {
    console.log('Testing email with:');
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '********' : 'MISSING');

    try {
        await sendEmail({
            to: process.env.SMTP_USER, // Send to self
            subject: 'SMTP Test - HRMS',
            html: '<h1>If you see this, email is working!</h1>'
        });
        console.log('✅ Local email test passed!');
    } catch (error) {
        console.error('❌ Local email test failed:');
        console.error(error);
    }
}

testEmail();
