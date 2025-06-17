import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUtensils, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import './Home.css';
import Header from '../../Header/Header';
import Button from '../../Button/Button';


const Home = () => {


const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([
    { id: 1, name: 'Golden Plate', cuisine: 'Italian', rating: 4.8, image: 'https://via.placeholder.com/300x200' },
    { id: 2, name: 'Spice Garden', cuisine: 'Indian', rating: 4.5, image: 'https://via.placeholder.com/300x200' },
    { id: 3, name: 'Ocean View', cuisine: 'Seafood', rating: 4.7, image: 'https://via.placeholder.com/300x200' },
    { id: 4, name: 'Amber Lounge', cuisine: 'French', rating: 4.9, image: 'https://via.placeholder.com/300x200' },
  ]);

  const [upcomingBookings, setUpcomingBookings] = useState([
    { id: 101, restaurant: 'Golden Plate', date: '2025-06-15', time: '19:00', guests: 2 },
    { id: 102, restaurant: 'Spice Garden', date: '2025-06-20', time: '20:00', guests: 4 },
  ]);

  

const handleBooking = () => {
  navigate('/booking');
};


  return (
    <div className="home-page">
      <Header />

      <Container className="py-5">
        <Row className="mb-5">
          <Col>
            <div className="welcome-banner">
              <h1>Welcome, User!</h1>
              <p>Find and book the best restaurants in your area</p>
              <Button onClick={handleBooking}>Book a Table</Button>
              </div>
          </Col>
        </Row>


      </Container>
    </div>
  );
};

export default Home;