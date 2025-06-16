import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra nếu người dùng đã đăng nhập trước đó
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []); const login = (userData) => {
        // Store the complete user data
        localStorage.setItem('user', JSON.stringify(userData));

        // Also store token and role separately for route protection
        if (userData.token) localStorage.setItem('token', userData.token);
        if (userData.role) localStorage.setItem('userRole', userData.role);

        setCurrentUser(userData);
    }; const logout = () => {
        // Clear all auth data from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');

        setCurrentUser(null);
        // Có thể thêm API call để logout ở server
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);