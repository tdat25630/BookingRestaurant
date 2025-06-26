import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUserCircle, FaSave, FaKey } from 'react-icons/fa';
import axios from 'axios';
import ProfileForm from './ProfileForm';
import './UserProfile.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        role: 'user'
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));

                if (!storedUser || !storedUser._id) {
                    throw new Error('User information not found');
                }

                const token = localStorage.getItem('token');

                const response = await axios.get(`http://localhost:8080/api/user/${storedUser._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });

                setUser(response.data);
                setFormData({
                    username: response.data.username || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    role: response.data.role || 'user',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });

                setError(null);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load profile. ' + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Form validation
            if (showPasswordFields) {
                if (!formData.currentPassword) {
                    throw new Error('Current password is required');
                }
                if (formData.newPassword !== formData.confirmPassword) {
                    throw new Error('New passwords do not match');
                }
            }

            const token = localStorage.getItem('token');

            // Prepare update data - only allow username and phone to be updated
            const updateData = {
                username: formData.username,
                phone: formData.phone
            };

            // Add password fields if changing password
            if (showPasswordFields && formData.currentPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.password = formData.newPassword || '';
            }

            const response = await axios.put(
                `http://localhost:8080/api/user/updateUser/${user._id}`,
                updateData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }
            );

            // Update local user data
            setUser(response.data);

            // Update localStorage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({
                ...storedUser,
                username: response.data.username
            }));

            setSuccess('Profile updated successfully');

            // Reset password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            setShowPasswordFields(false);
            setIsEditing(false);

        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                <Spinner animation="border" />
                <span className="ms-2">Loading profile...</span>
            </Container>
        );
    }

    return (
        <Container className="my-5 user-profile-container">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="profile-card shadow-sm">
                        <Card.Header className="bg-dark text-white">
                            <div className="d-flex align-items-center">
                                <FaUserCircle size={24} className="me-2" />
                                <h3 className="mb-0">My Profile</h3>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            {!isEditing ? (
                                <div className="profile-info">
                                    <Row className="mb-3 profile-row">
                                        <Col md={4} className="profile-label">Username:</Col>
                                        <Col md={8}>{user?.username}</Col>
                                    </Row>
                                    <Row className="mb-3 profile-row">
                                        <Col md={4} className="profile-label">Email:</Col>
                                        <Col md={8}>{user?.email}</Col>
                                    </Row>
                                    <Row className="mb-3 profile-row">
                                        <Col md={4} className="profile-label">Role:</Col>
                                        <Col md={8}>
                                            <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                {user?.role}
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3 profile-row">
                                        <Col md={4} className="profile-label">Phone:</Col>
                                        <Col md={8}>{user?.phone || 'Not provided'}</Col>
                                    </Row>

                                    <Button
                                        variant="primary"
                                        onClick={() => setIsEditing(true)}
                                        className="mt-3"
                                    >
                                        Edit Profile
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveProfile}>
                                    <ProfileForm
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        showPasswordFields={showPasswordFields}
                                        setShowPasswordFields={setShowPasswordFields}
                                        showPassword={showPassword}
                                        setShowPassword={setShowPassword}
                                    />

                                    <div className="mt-4 d-flex justify-content-between">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-1" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave className="me-1" /> Save Changes
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setShowPasswordFields(false);
                                                // Reset form to original values
                                                setFormData({
                                                    username: user.username,
                                                    email: user.email,
                                                    phone: user.phone || '',
                                                    role: user.role,
                                                    currentPassword: '',
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                });
                                            }}
                                            type="button"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserProfile;