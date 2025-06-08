import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import MenuManagement from "../pages/admin/MenuManagement";

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

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="menu" element={<MenuManagement />} />

        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};

export default AdminRoutes;
