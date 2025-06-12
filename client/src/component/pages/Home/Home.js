import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUtensils, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import './Home.css';
import Header from '../../Header/Header';
import Button from '../../Button/Button';

const Home = () => {
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

  return (
    <div className="home-page">
      <Header />

      <Container className="py-5">
        <Row className="mb-5">
          <Col>
            <div className="welcome-banner">
              <h1>Welcome, User!</h1>
              <p>Find and book the best restaurants in your area</p>
              <Button>Book a Table</Button>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <h2 className="section-title">
              <FontAwesomeIcon icon={faUtensils} className="me-2" />
              Popular Restaurants
            </h2>
          </Col>
        </Row>

        <Row>
          {restaurants.map(restaurant => (
            <Col key={restaurant.id} xs={12} md={6} lg={3} className="mb-4">
              <Card className="restaurant-card">
                <div className="card-img-container">
                  <Card.Img variant="top" src={restaurant.image} />
                  <div className="card-rating">{restaurant.rating}</div>
                </div>
                <Card.Body>
                  <Card.Title>{restaurant.name}</Card.Title>
                  <Card.Text>{restaurant.cuisine} Cuisine</Card.Text>
                  <Button fullWidth>Book Now</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mt-5 mb-4">
          <Col>
            <h2 className="section-title">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Your Upcoming Bookings
            </h2>
          </Col>
        </Row>

        <Row>
          {upcomingBookings.map(booking => (
            <Col key={booking.id} xs={12} md={6} className="mb-4">
              <Card className="booking-card">
                <Card.Body>
                  <Card.Title>{booking.restaurant}</Card.Title>
                  <Card.Text>
                    <div><strong>Date:</strong> {booking.date}</div>
                    <div><strong>Time:</strong> {booking.time}</div>
                    <div><strong>Guests:</strong> {booking.guests}</div>
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button variant="outline">Modify</Button>
                    <Button variant="danger">Cancel</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Home;