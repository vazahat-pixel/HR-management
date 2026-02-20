const admin = require('firebase-admin');
const serviceAccount = require('../../angle-courier-firebase-adminsdk-fbsvc-f2ae6ef5b2.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
