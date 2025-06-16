import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './Login.css';
import Button from '../../Button/Button';
import Input from '../../Input/Input';
import { useAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();
  const [email, setEmail] = useState('');
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
      setLoading(true);
      console.log('Sending login data:', { email, password });

      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      }, {
        withCredentials: true
      });

      console.log('Login response:', response); if (response.data) {
        console.log('Login successful, user data:', response.data);

        // Store auth data in localStorage as expected by ProtectedRoute
        localStorage.setItem('token', response.data.token || 'dummy-token'); // In case token isn't provided
        localStorage.setItem('userRole', response.data.role || 'user');

        // Call login from AuthContext
        login(response.data);

        console.log('About to navigate based on role:', response.data.role);

        // Redirect based on user role
        if (response.data.role === 'admin') {
          console.log('Redirecting to admin page');
          navigate('/admin');
        } else {
          console.log('Redirecting to home page');
          navigate('/home');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login failed - Error object:', err);
      console.error('Error type:', typeof err);
      console.error('Error toString:', String(err));
      console.error('Response available:', err.response ? 'Yes' : 'No');

      let errorMessage = "Login failed. Please try again.";

      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      }

      setError(errorMessage);
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
        )}        <form noValidate onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="text"
            placeholder="Enter your Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mt-4">
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div><div className="text-center mt-3">
            <p className="mb-0">Don't have an account? <Link to="/register" className='register-link'>Register</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
