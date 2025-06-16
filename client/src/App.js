import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import your components
import Home from './component/pages/Home/Home';
import AdminHome from './component/pages/AdminHome/AdminHome';
import Login from './component/pages/Login/Login';
import Register from './component/pages/Register/Register';
// Import other components as needed

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    // Check auth state from multiple sources to be safe
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userStr = localStorage.getItem('user');

    console.log('ProtectedRoute check - token:', token);
    console.log('ProtectedRoute check - userRole:', userRole);
    console.log('ProtectedRoute check - user exists:', !!userStr);

    // Determine if user is authenticated - check both token and user object
    const isAuthenticated = token || userStr;

    // Get the user role - either from separate storage or from user object
    let role = userRole;
    if (!role && userStr) {
        try {
            const userData = JSON.parse(userStr);
            role = userData.role;
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }

    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        // Not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && role !== 'admin') {
        console.log('Not admin, redirecting to home');
        // Not an admin, redirect to home
        return <Navigate to="/home" replace />;
    }

    console.log('Authentication successful, rendering protected content');
    // User is authenticated and has required role
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />                    {/* Protected routes */}
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin={true}>
                                <AdminHome />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default route */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    {/* Add other routes as needed */}
                </Routes>
            </Router>        </AuthProvider>
    );
}

export default App;
