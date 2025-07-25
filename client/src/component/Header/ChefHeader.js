import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faSignOutAlt,
  faClock,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './ChefHeader.css';

const ChefHeader = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Navbar expand="lg" className="chef-navbar" variant="dark">
      <Container>
        <Navbar.Brand href="/chef/dashboard" className="chef-brand">
          <FontAwesomeIcon icon={faUtensils} className="me-2" />
          Bếp
        </Navbar.Brand>

        <div className="chef-time">
          <FontAwesomeIcon icon={faClock} className="me-1" />
          {formatTime(currentTime)}
        </div>

        <Navbar.Toggle aria-controls="chef-navbar-nav" />
        <Navbar.Collapse id="chef-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/chef/dashboard" className="chef-nav-link">
              Dashboard
            </Nav.Link>
            <Nav.Link href="/chef/item" className="chef-nav-link">
              Menu
            </Nav.Link>
          </Nav>

          {/* Actions */}
          <Nav className="ms-auto">

            <NavDropdown
              title={
                <span>
                  <FontAwesomeIcon icon={faUtensils} className="me-1" />
                  Chef
                </span>
              }
              id="chef-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item href="/chef/profile">
                <FontAwesomeIcon icon={faCog} className="me-1" />
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default ChefHeader;
