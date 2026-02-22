import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

import { initSocket, disconnectSocket } from '../services/socket';
import { requestNotificationPermission } from '../services/notificationService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Immediate Restore from Local Storage
        const token = localStorage.getItem('hrms_token');
        const savedUser = localStorage.getItem('hrms_user');

        if (token && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                initSocket(parsedUser._id);
            } catch (e) {
                console.error("Failed to parse saved user", e);
                localStorage.removeItem('hrms_user');
            }
        }

        // 2. Background Validation (Non-blocking)
        if (token) {
            authAPI.getMe()
                .then(res => {
                    // Update user data with latest from server
                    setUser(res.data.user);
                    localStorage.setItem('hrms_user', JSON.stringify(res.data.user));
                    initSocket(res.data.user._id);
                    requestNotificationPermission(); // Register FCM Backgroundly
                })
                .catch(err => {
                    console.error("Session validation failed:", err);
                    // Only logout if 401 (Unauthorized) - ignore network errors to keep session alive offline
                    if (err.response && err.response.status === 401) {
                        logout();
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (employeeId, password) => {
        const res = await authAPI.login(employeeId, password);
        const { token, user: userData } = res.data; // Ensure backend returns { token, user }
        localStorage.setItem('hrms_token', token);
        localStorage.setItem('hrms_user', JSON.stringify(userData));
        setUser(userData);
        initSocket(userData._id);
        requestNotificationPermission(); // Register FCM
        return userData;
    };

    const loginWithOtp = async (mobile, otp) => {
        const res = await authAPI.verifyOtp({ mobile, otp });
        const { token, user: userData } = res.data;
        localStorage.setItem('hrms_token', token);
        localStorage.setItem('hrms_user', JSON.stringify(userData));
        setUser(userData);
        initSocket(userData._id);
        return userData;
    };

    const sendOtp = async (mobile) => {
        const res = await authAPI.sendOtp(mobile);
        return res.data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hrms_token');
        localStorage.removeItem('hrms_user');
        disconnectSocket();
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithOtp, sendOtp, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
