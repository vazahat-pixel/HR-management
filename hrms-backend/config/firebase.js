const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;

try {
    const serviceAccountPath = path.join(__dirname, '../../angle-courier-firebase-adminsdk-fbsvc-f2ae6ef5b2.json');

    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin Initialized');
        initialized = true;
    } else {
        console.warn('⚠️ Firebase service account missing. Push notifications will be disabled.');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
}

module.exports = initialized ? admin : null;
