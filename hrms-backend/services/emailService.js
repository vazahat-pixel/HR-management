const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: (parseInt(process.env.SMTP_PORT) || 465) === 465, // true for 465, false for other ports (like 587)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ SMTP_USER or SMTP_PASS missing. Email skipped.');
            console.log(`[Validation Email] To: ${to}, Subject: ${subject}`);
            return;
        }

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"HR Management System" <no-reply@hrms.com>',
            to,
            subject,
            text, // plain text body
            html, // html body
        });

        console.log(`📧 Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
    }
};

module.exports = { sendEmail };
