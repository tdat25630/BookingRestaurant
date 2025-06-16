import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider } from "./context/OrderContext";
import { SessionProvider } from "./context/SessionContext";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Home from './component/pages/Home/Home';
import Login from './component/pages/Login/Login';
import Register from './component/pages/Register/Register';
import Reservation from "./component/pages/Reservation/Reservation";

import MenuPage from "./component/pages/Menu/MenuPage";
import ConfirmOrderPage from "./component/pages/Order/ConfirmOrderPage"; 
import CheckoutPage from "./component/pages/Order/CheckoutPage"; 


import AdminRoutes from "./routes/AdminRoutes";

function App() {
    return (
        <SessionProvider> 
    <OrderProvider>
        <Router>
            <Routes>
            <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/" element={<Navigate to="/login" />} />

                <Route path="/booking" element={<Reservation />} />

                <Route path="/menu" element={<MenuPage />} /> 
                <Route path="/confirm" element={<ConfirmOrderPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />

                <Route path="/admin/*" element={<AdminRoutes />} />

            </Routes>
        </Router>
        </OrderProvider>
        </SessionProvider>
    );
}

export default App;
