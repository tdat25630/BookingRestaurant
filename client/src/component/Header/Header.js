import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

const Header = () => {
    return (
        <Navbar expand="lg" className="custom-navbar" variant="dark">
            <Container>
                <Navbar.Brand href="/home" className="brand">
                    <FontAwesomeIcon icon={faUtensils} className="me-2" />
                    Restaurant Booking
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link href="/home" className="nav-link">Home</Nav.Link>
                        <Nav.Link href="/restaurants" className="nav-link">Restaurants</Nav.Link>
                        <Nav.Link href="/bookings" className="nav-link">My Bookings</Nav.Link>

                        <NavDropdown
                            title={
                                <span>
                                    <FontAwesomeIcon icon={faUser} className="me-1" />
                                    Profile
                                </span>
                            }
                            id="basic-nav-dropdown"
                            align="end"
                        >
                            <NavDropdown.Item href="/profile">Settings</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="/logout">
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

export default Header;