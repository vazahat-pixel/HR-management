importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBaJieERpPDe5va9cJsdIJ0sPnUn0_K3fs",
    authDomain: "angle-courier.firebaseapp.com",
    projectId: "angle-courier",
    storageBucket: "angle-courier.firebasestorage.app",
    messagingSenderId: "713985952201",
    appId: "1:713985952201:web:4e528bc8fc7c894b7d8018"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
