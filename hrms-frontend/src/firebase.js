import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let googleProvider;
let storage;
let db;

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined") {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        storage = getStorage(app);
        db = getFirestore(app);
        console.log("Firebase initialized successfully");
    } else {
        console.warn("Firebase API Key is missing. Firebase features will be disabled.");
    }
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

export { auth, googleProvider, storage, db };

// Messaging is only supported in secure contexts (HTTPS) or localhost
let messaging = null;
if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    try {
        messaging = getMessaging(app);
    } catch (error) {
        console.warn("Firebase messaging failed to initialize", error);
    }
}

export { messaging, getToken, onMessage };
export default app;
