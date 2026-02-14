import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const savedUser = localStorage.getItem('hrms_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let mockUser = null;

                // Admin Login
                if (email === 'admin@hrms.com' && password === 'admin123') {
                    mockUser = { id: 1, name: 'Admin Manager', email: 'admin@hrms.com', role: 'admin' };
                }
                // Employee Login
                else if (email === 'employee@hrms.com' && password === 'emp123') {
                    mockUser = { id: 2, name: 'John Doe', email: 'employee@hrms.com', role: 'employee' };
                }

                if (mockUser) {
                    setUser(mockUser);
                    localStorage.setItem('hrms_user', JSON.stringify(mockUser));
                    resolve(mockUser);
                } else {
                    reject('Invalid credentials');
                }
            }, 500);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hrms_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
