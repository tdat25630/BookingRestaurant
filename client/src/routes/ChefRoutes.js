import { Routes, Route, Navigate } from 'react-router-dom';
import ChefOrder from '../component/pages/Chef/ChefOrder';
// import ChefDashboard from '../component/pages/Dashboard/ChefDashboard';

const isChef = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "chef";
};

const ChefRoutes = () => {
  return (
    <Routes>
      {isChef() ? (
        <>
          {/* Main Chef Order Management Page */}
          <Route path="/" element={<ChefOrder />} />
          <Route path="/orders" element={<ChefOrder />} />
          
          {/* Future routes for other chef functionalities */}
          {/* <Route path="/dashboard" element={<ChefDashboard />} /> */}
          {/* <Route path="/menu" element={<ChefMenu />} /> */}
          {/* <Route path="/reports" element={<ChefReports />} /> */}
          
          {/* Redirect any unknown chef routes to main order page */}
          <Route path="*" element={<Navigate to="/chef" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default ChefRoutes;