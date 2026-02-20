import { messaging, getToken, onMessage } from '../firebase';
import { notificationsAPI } from './api';

export const requestNotificationPermission = async () => {
    try {
        if (!messaging) return null;

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: 'BBt3KCZDrZN0c4TrVavL9OBYAdoH4IrKmn7ZXJ4BjSrQU8cImAem0w3zRZ9rHJENMe06GKbDiiFnruXK4VQ8vtc'
            });

            if (token) {
                console.log('FCM Token:', token);
                // Save token to backend
                await notificationsAPI.saveFcmToken(token);
                return token;
            }
        }
    } catch (error) {
        console.error('Notification permission error:', error);
    }
    return null;
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });
