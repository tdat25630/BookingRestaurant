import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        fullName: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [updating, setUpdating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Lấy thông tin user từ localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData({
                username: parsedUser.username || '',
                email: parsedUser.email || '',
                phone: parsedUser.phone || '',
                fullName: parsedUser.fullName || ''
            });
        }
        setLoading(false);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 5000);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const goToHomePage = () => {
        const userRole = user?.role;
        switch(userRole) {
            case 'admin':
                navigate('/admin/dashboard');
                break;
            case 'cashier':
                navigate('/cashier/tables');
                break;
            case 'chef':
                navigate('/chef/orders');
                break;
            case 'staff':
                navigate('/staff/reservations');
                break;
            default:
                navigate('/home');
        }
    };

    const handleSaveProfile = async () => {
        try {
            setUpdating(true);
            
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8080/api/user/updateUser/${user._id}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update localStorage
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setEditing(false);
            
            showMessage('success', 'Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            showMessage('error', error.response?.data?.message || 'Error updating profile');
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        // Validate password inputs
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            showMessage('error', 'Please fill in all password fields');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('error', 'New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showMessage('error', 'New password must be at least 6 characters long');
            return;
        }

        try {
            setUpdating(true);
            
            const token = localStorage.getItem('token');
            // Fixed API endpoint for change password
            await axios.put(
                `http://localhost:8080/api/user/change-password/${user._id}`,
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Reset password form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordForm(false);
            
            showMessage('success', 'Password changed successfully!');
        } catch (error) {
            console.error('Error changing password:', error);
            showMessage('error', error.response?.data?.message || 'Error changing password');
        } finally {
            setUpdating(false);
        }
    };

    const resetPasswordForm = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setShowPasswordForm(false);
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* Navigation Header */}
            <div className="profile-nav-header">
                <div className="nav-left">
                    <button 
                        className="nav-btn back-btn"
                        onClick={goToHomePage}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                
                <div className="nav-center">
                    <h1 className="nav-title">👤 User Profile</h1>
                </div>
                
                <div className="nav-right">
                    <span className="user-info">
                        {user?.username} ({user?.role})
                    </span>
                    <button 
                        className="nav-btn logout-btn"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>

            <div className="profile-header">
                <p>Manage your account information and security</p>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h2>{user?.username || 'User'}</h2>
                        <span className="user-role">{user?.role || 'User'}</span>
                    </div>

                    <div className="profile-tabs">
                        <button 
                            className={`tab-btn ${!showPasswordForm ? 'active' : ''}`}
                            onClick={() => setShowPasswordForm(false)}
                        >
                            📝 Profile Information
                        </button>
                        <button 
                            className={`tab-btn ${showPasswordForm ? 'active' : ''}`}
                            onClick={() => setShowPasswordForm(true)}
                        >
                            🔒 Change Password
                        </button>
                    </div>

                    {!showPasswordForm ? (
                        // Profile Information Form
                        <div className="profile-form">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    disabled={!editing}
                                    className={editing ? 'editable' : 'readonly'}
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!editing}
                                    className={editing ? 'editable' : 'readonly'}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!editing}
                                    className={editing ? 'editable' : 'readonly'}
                                />
                            </div>

                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    disabled={!editing}
                                    className={editing ? 'editable' : 'readonly'}
                                />
                            </div>

                            <div className="form-actions">
                                {!editing ? (
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => setEditing(true)}
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                ) : (
                                    <div className="edit-actions">
                                        <button 
                                            className="btn btn-success"
                                            onClick={handleSaveProfile}
                                            disabled={updating}
                                        >
                                            {updating ? '💾 Saving...' : '💾 Save Changes'}
                                        </button>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setEditing(false);
                                                // Reset form data
                                                setFormData({
                                                    username: user?.username || '',
                                                    email: user?.email || '',
                                                    phone: user?.phone || '',
                                                    fullName: user?.fullName || ''
                                                });
                                            }}
                                            disabled={updating}
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Change Password Form
                        <div className="password-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter your current password"
                                    className="editable"
                                />
                            </div>

                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password (min 6 characters)"
                                    className="editable"
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm your new password"
                                    className="editable"
                                />
                            </div>

                            <div className="password-requirements">
                                <h4>Password Requirements:</h4>
                                <ul>
                                    <li className={passwordData.newPassword.length >= 6 ? 'valid' : 'invalid'}>
                                        At least 6 characters long
                                    </li>
                                    <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'valid' : 'invalid'}>
                                        Passwords match
                                    </li>
                                </ul>
                            </div>

                            <div className="form-actions">
                                <div className="edit-actions">
                                    <button 
                                        className="btn btn-warning"
                                        onClick={handleChangePassword}
                                        disabled={updating || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                                    >
                                        {updating ? '🔒 Changing...' : '🔒 Change Password'}
                                    </button>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={resetPasswordForm}
                                        disabled={updating}
                                    >
                                        ❌ Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;