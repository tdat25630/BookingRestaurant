import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Home from './component/pages/Home/Home';
import Login from './component/pages/Login/Login';
import { AuthProvider } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('user');
    if (!isAuthenticated) {
        return <Navigate to="/login" />
    }
    return children;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Router>

        </AuthProvider>

    );
}

export default App;