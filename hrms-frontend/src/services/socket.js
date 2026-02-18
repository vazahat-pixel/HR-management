import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket;

export const initSocket = (userId) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
    });

    socket.on('connect', () => {
        console.log('🔌 Connected to real-time server');
        if (userId) {
            socket.emit('join', userId);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔌 Disconnected from real-time server');
    });

    socket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
