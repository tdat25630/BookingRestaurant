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

import StaffRoutes from './routes/StaffRoutes';
import ZaloPayGateway from "./component/pages/payment/ZaloPayGateway";
import PaymentResult from "./component/pages/payment/PaymentResult";

import AdminRoutes from "./routes/AdminRoutes";
import CashierRoutes from "./routes/CashierRoutes";
import ChefRoutes from "./routes/ChefRoutes";
import UserManagement from './component/pages/UserManagement/UserManagement';
import AdminLayout from './component/LayoutAdmin/AdminLayout';
import UserProfile from './component/pages/UserProfile/UserProfile';
import AdminDashboard from './component/pages/Dashboard/AdminDashboard';
import PromotionManagement from './component/pages/PromotionManagement/PromotionManagement';

function App() {
    return (
        <SessionProvider>
            <OrderProvider>
                <Router>
                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/" element={<Navigate to="/home" />} />

                        <Route path="/booking" element={<Reservation />} />

                        <Route path="/menu" element={<MenuPage />} />
                        <Route path="/confirm" element={<ConfirmOrderPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/payment-gateway" element={<ZaloPayGateway />} />
                        <Route path="/payment-result" element={<PaymentResult />} />
                        <Route path="/admin/*" element={<AdminRoutes />} />
                        <Route path="/staff/*" element={<StaffRoutes />} />
                        <Route path="/cashier/*" element={<CashierRoutes />} />
                        <Route path="/chef/*" element={<ChefRoutes />} />
                        <Route path='admin' element={<AdminLayout />}>
                            <Route path="/admin/users" element={<UserManagement />} />
                            <Route path="/admin/profile" element={

                                <UserProfile />

                            } />
                            <Route path="/admin/promotions" element={<PromotionManagement />} />
                            <Route path="/admin" element={

                                <AdminDashboard />

                            } />
                        </Route>
                    </Routes>
                </Router>
            </OrderProvider>
        </SessionProvider>
    );
}

export default App;

