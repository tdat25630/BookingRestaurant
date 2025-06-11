import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/user/Home";

import Register from "./pages/auth/Register";
import Reservation from "./pages/reservation/Reservation";
import Login from "./pages/auth/Login";
import AdminRoutes from "./routes/AdminRoutes";


import MenuPage from './pages/user/MenuPage';

function App() {
  return (
    <Router>
      
      {/* <Header /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<MenuPage />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking" element={<Reservation />} />
     

    
      <Route path="/admin/*" element={<AdminRoutes />} />


      </Routes>
      {/* <Footer /> */}
    </Router>
  );
}

export default App;
