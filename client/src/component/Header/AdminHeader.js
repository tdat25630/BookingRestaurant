import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faUserShield, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Navbar expand="lg" className="custom-navbar" variant="dark">
            <Container>
                <Navbar.Brand href="/admin/dashboard" className="brand">
                    <FontAwesomeIcon icon={faUtensils} className="me-2" />
                    Admin Panel
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="admin-navbar-nav" />
                <Navbar.Collapse id="admin-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link href="/admin/dashboard" className="nav-link">Dashboard</Nav.Link>
                        <Nav.Link href="/admin/tables" className="nav-link">Manage Tables</Nav.Link>
                        <Nav.Link href="/admin/reservation" className="nav-link">Manage Bookings</Nav.Link>
                        <Nav.Link href="/admin/users" className="nav-link">User Management</Nav.Link>
                        <Nav.Link href="/admin/category" className="nav-link">Category Management</Nav.Link>
                        <Nav.Link href="/admin/item" className="nav-link">MenuItem Management</Nav.Link>

                        <NavDropdown
                            title={
                                <span>
                                    <FontAwesomeIcon icon={faUserShield} className="me-1" />
                                    Admin
                                </span>
                            }
                            id="admin-nav-dropdown"
                            align="end"
                        >
                            <NavDropdown.Item href="/admin/profile">Profile</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item onClick={handleLogout}>
                                <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                                Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AdminHeader;
