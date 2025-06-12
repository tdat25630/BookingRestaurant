import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './Login.css';
import Button from '../../Button/Button';
import Input from '../../Input/Input';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        email,
        password
      }, {
        withCredentials: true
      });
      localStorage.setItem('user', JSON.stringify(response.data));

      Navigate('/home')
    } catch (err) {
      console.error('Login failed: ', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');

    } finally {
      setLoading(false);
    }

    setValidated(true);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-4">
          <FontAwesomeIcon icon={faUtensils} className="restaurant-icon" />
          <h2 className="login-title">Restaurant Booking</h2>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="d-grid gap-2 mt-4">
            <Button type="submit" fullWidth>
              Login
            </Button>
          </div>

          <div className="text-center mt-3">
            <p className="mb-0">Don't have an account? <a href="#register" className="register-link">Register</a></p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
