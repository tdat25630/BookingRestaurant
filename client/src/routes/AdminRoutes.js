import { Routes, Route, Navigate } from 'react-router-dom';
<<<<<<< HEAD
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import AdminTableQRPage from '../pages/admin/AdminTableQRPage';
import AdminReservationPage from '../pages/admin/AdminReservationPage';
=======
import AdminDashboard from '../component/pages/Dashboard/AdminDashboard';
import AdminTableQRPage from '../component/pages/ManagementTable/AdminTableQRPage';

import AdminReservation from '../component/pages/Reservation/AdminReservation';
import AdminCheckoutPage from "../component/pages/Checkout/AdminCheckoutPage";
import AdminMenuCategory from '../component/pages/Menu/AdminmenuCategory';
import AdminMEnuItem from '../component/pages/Menu/AdminmenuItem';
>>>>>>> origin/test
const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "admin";
};

const AdminRoutes = () => {
  return (
    <Routes>
      {isAdmin() ? (
        <>
           <Route path="/" element={<AdminDashboard />} /> 

<<<<<<< HEAD
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="/tables" element={<AdminTableQRPage />} />
=======
          {/* <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} /> */}
          <Route path="reservation" element={<AdminReservation />} />
          <Route path="tables" element={<AdminTableQRPage />} />
          <Route path="checkout" element={<AdminCheckoutPage />} />
          <Route path="category" element={<AdminMenuCategory />} />
          <Route path="item" element={<AdminMEnuItem />} />

>>>>>>> origin/test

<Route path="/reservations" element={<AdminReservationPage />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default AdminRoutes;
