import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faUserShield, faSignOutAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link } from 'react-router-dom';
import './AdminHeader.css';
import { FaGift, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const AdminHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Navbar expand="lg" className="custom-navbar" variant="dark">
            <Container>
                <Navbar.Brand href="/admin" className="brand">
                    <FontAwesomeIcon icon={faUtensils} className="me-2" />
                    Admin Panel
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="admin-navbar-nav" />
                <Navbar.Collapse id="admin-navbar-nav">                    <Nav className="ms-auto">
                    <Nav.Link as={Link} to="/admin" className="nav-link">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/admin/tables" className="nav-link">Tables</Nav.Link>
                    <Nav.Link as={Link} to="/admin/reservation" className="nav-link">Bookings</Nav.Link>
                    <Nav.Link as={Link} to="/admin/users" className="nav-link">
                        <FontAwesomeIcon icon={faUsers} className="me-1" />
                        User
                    </Nav.Link>
                    <Nav.Link href="/admin/promotions">
                        <FaGift className="me-2" />
                        Promotions
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/category" className="nav-link">Category</Nav.Link>
                    <Nav.Link as={Link} to="/admin/item" className="nav-link">Menu</Nav.Link>
                    <NavDropdown
                        title={<span><FaUserCircle className="me-1" />Admin</span>}
                        id="admin-dropdown"
                        align="end"
                    >
                        <NavDropdown.Item as={Link} to="/admin/profile">
                            <FaUserCircle className="me-1" />
                            My Profile
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={handleLogout}>
                            <FaSignOutAlt className="me-1" />
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
