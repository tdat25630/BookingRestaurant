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
const ProtectedRoute = ({ element, requireAdmin = false }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        // Not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && userRole !== 'admin') {
        // Not an admin, redirect to home
        return <Navigate to="/home" replace />;
    }

    // User is authenticated and has required role
    return element;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route
                        path="/home"
                        element={<ProtectedRoute element={<Home />} />}
                    />
                    <Route
                        path="/admin"
                        element={<ProtectedRoute element={<AdminHome />} requireAdmin={true} />}
                    />

                    {/* Default route */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    {/* Add other routes as needed */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
