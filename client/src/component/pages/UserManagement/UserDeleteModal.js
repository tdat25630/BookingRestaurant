// filepath: e:\WDP_SU25\BookingRestaurant\client\src\components\admin\users\UserDeleteModal.js
import React from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

const UserDeleteModal = ({ show, handleClose, user, onDeleteSuccess, onError }) => {
    const handleDeleteUser = async () => {
        try {
            const token = localStorage.getItem('token');

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.delete(`http://localhost:8080/api/user/deleteUser/${user._id}`, config);

            // Notify parent of success
            onDeleteSuccess();
        } catch (err) {
            onError('Failed to delete user. ' + (err.response?.data?.message || err.message));
            console.error('Error deleting user:', err);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete user <strong>{user?.username}</strong>? This action cannot be undone.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteUser}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserDeleteModal;