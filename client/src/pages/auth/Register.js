import React, { useState } from 'react';
import axios from 'axios';
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/auth/register', form);
      setSuccess('Registration successful. You can now login.');
      setErr('');
    } catch (error) {
      setErr(error.response?.data?.message || "Registration failed");
      setSuccess('');
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h2 style={styles.title}>Register</h2>
        {err && <p style={styles.error}>{err}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <form onSubmit={handleRegister} style={styles.form}>
          <input
            name="username"
            placeholder="Username"
            required
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            onChange={handleChange}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Register</button>
        </form>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0, 70, 200, 0.2)',
    backgroundColor: '#f0f8ff',
    textAlign: 'center',
  },
  title: {
    color: '#0047b3',
    marginBottom: '20px',
    fontWeight: '600',
  },
  error: {
    color: '#d32f2f',
    marginBottom: '15px',
  },
  success: {
    color: '#388e3c',
    marginBottom: '15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px 15px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #0047b3',
    outline: 'none',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#0047b3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.3s ease',
  },
};

export default Register;
