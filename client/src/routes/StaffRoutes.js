import { Routes, Route, Navigate } from 'react-router-dom';
import StaffReservation from '../component/pages/Reservation/StaffReservation';
import Order from '../component/pages/staff/Staff';
const isStaff = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "staff";
};

const StaffRoutes = () => {
  return (
    <Routes>
      {isStaff() ? (
        <>
          {/* Main Staff Order Management Page */}
          <Route path="/" element={<StaffReservation />} />
          <Route path="/reservation" element={<StaffReservation />} />
          <Route path="/order" element={<Order />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default StaffRoutes;
