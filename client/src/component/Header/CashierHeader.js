import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link } from 'react-router-dom';
import './AdminHeader.css';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const CashierHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Navbar expand="lg" className="custom-navbar" variant="dark">
            <Container>
                <Navbar.Brand as={Link} to="/cashier/tables" className="brand">
                    <FontAwesomeIcon icon={faUtensils} className="me-2" />
                    Cashier Panel
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="cashier-navbar-nav" />
                <Navbar.Collapse id="cashier-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/cashier/tables" className="nav-link">Manage Tables</Nav.Link>
                        <Nav.Link as={Link} to="/cashier/reservation" className="nav-link">Manage Bookings</Nav.Link>
                        <Nav.Link as={Link} to="/cashier/category" className="nav-link">Category Management</Nav.Link>
                        <Nav.Link as={Link} to="/cashier/item" className="nav-link">MenuItem Management</Nav.Link>
                        
                        <NavDropdown
                            title={<span><FaUserCircle className="me-1" />Cashier</span>}
                            id="cashier-dropdown"
                            align="end"
                        >
                            <NavDropdown.Item as={Link} to="/cashier/profile">
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

export default CashierHeader;