const Notification = require('../models/Notification');
const User = require('../models/User');

const { sendRealTimeNotification } = require('../socket');

/**
 * Send Notification (In-App + Push + Real-Time)
 */
const sendNotification = async (userId, title, message, data = {}) => {
    try {
        // 1. Save to Database (In-App)
        const notification = await Notification.create({
            userId,
            title,
            message
        });

        // 2. Emit Real-Time Socket Event
        sendRealTimeNotification(userId, notification);

        // 3. Send Push Notification (FCM)
        const user = await User.findById(userId).select('fcmToken');
        if (user && user.fcmToken) {
            await sendPushNotification(user.fcmToken, title, message, data);
        }

        return notification;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Notification Service Error:', error);
        }
        return null;
    }
};

const admin = require('../config/firebase');

/**
 * FCM Push Notification Implementation
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
    try {
        const message = {
            notification: { title, body },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK', // For mobile if needed
            },
            token: fcmToken
        };

        const response = await admin.messaging().send(message);
        console.log('Successfully sent FCM message:', response);
        return true;
    } catch (error) {
        console.error('FCM Send Error:', error);
        return false;
    }
};

module.exports = { sendNotification };
