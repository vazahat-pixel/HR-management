const { Server } = require('socket.io');

let io;
const userSockets = new Map(); // userId -> socketId

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);

        socket.on('join', (userId) => {
            if (userId) {
                userSockets.set(userId, socket.id);
                socket.join(userId);
                console.log(`👤 User ${userId} joined their private channel`);
            }
        });

        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
            // Remove from mapping
            for (let [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

const sendRealTimeNotification = (userId, notification) => {
    if (io) {
        io.to(userId).emit('new_notification', notification);
        console.log(`📡 Real-time notification sent to user ${userId}`);
    }
};

module.exports = { initSocket, getIO, sendRealTimeNotification };
