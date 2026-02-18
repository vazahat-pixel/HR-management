/**
 * SMS Service
 * In production, replace with real API calls to Twilio, MSG91, etc.
 */
const sendSMS = async (mobile, message) => {
    try {
        // Production implementation example:
        // await axios.post('https://api.sms-gateway.com/send', {
        //     apiKey: process.env.SMS_API_KEY,
        //     to: mobile,
        //     message: message
        // });

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[SMS Simulation] To: ${mobile} | Message: ${message}`);
        }

        return true;
    } catch (error) {
        console.error('SMS Send Error:', error);
        return false;
    }
};

const sendOTP = async (mobile, otp) => {
    const message = `Your HRMS login OTP is ${otp}. Valid for 5 minutes.`;
    return sendSMS(mobile, message);
};

module.exports = { sendSMS, sendOTP };
