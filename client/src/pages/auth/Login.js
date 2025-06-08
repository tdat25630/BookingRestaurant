import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:8080/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      alert("Login successful!");
      localStorage.setItem("user", JSON.stringify(res.data));
    //   navigate('/');
    const role = res.data.role; // hoặc lấy mảng roles

    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'chef') {
      navigate('/chef');
    } else {
      navigate('/'); // mặc định cho user thường
    }

    } catch (error) {
      setErr(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h2 style={styles.title}>Login</h2>
        {err && <p style={styles.error}>{err}</p>}
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <p style={styles.text}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>
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
  text: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#0047b3',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default Login;
