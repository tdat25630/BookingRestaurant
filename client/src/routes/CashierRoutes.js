import { Routes, Route, Navigate } from 'react-router-dom';
import CashierCheckout from "../component/pages/Checkout/CashierCheckout";
import CashierTablePage from "../component/pages/ManagementTable/CashierTablePage";
import CashierReservation from '../component/pages/Reservation/CashierReservation';


const isCashier = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "cashier";
};

const CashierRoutes = () => {
  return (
    <Routes>
      {isCashier() ? (
        <>
          <Route path="/" element={<CashierTablePage />} />
          <Route path="/checkout" element={<CashierCheckout />} />
          <Route path="reservation" element={<CashierReservation />} />

          <Route path="tables" element={<CashierTablePage />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default CashierRoutes;