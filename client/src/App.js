import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { OrderProvider } from "./context/OrderContext";
import { SessionProvider } from "./context/SessionContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/user/Home";

import Register from "./pages/auth/Register";
import Reservation from "./pages/reservation/Reservation";
import Login from "./pages/auth/Login";
import AdminRoutes from "./routes/AdminRoutes";

import CheckoutPage from "./pages/user/CheckoutPage";
import MenuPage from "./pages/user/MenuPage";
import ConfirmOrderPage from "./components/ConfirmOrderPage"; 


function App() {
  return (
    <SessionProvider> 
    <OrderProvider>
    <Router>
      
      {/* <Header /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<MenuPage />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking" element={<Reservation />} />
        <Route path="/checkout" element={<CheckoutPage />} />

    
      <Route path="/admin/*" element={<AdminRoutes />} />

      <Route path="/confirm" element={<ConfirmOrderPage />} />

  

      </Routes>
      {/* <Footer /> */}
    </Router>
    </OrderProvider>
    </SessionProvider>
  );
}

export default App;
