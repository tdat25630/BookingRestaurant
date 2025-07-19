import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import CashierHeader from "../../Header/CashierHeader";
import "./CashierCheckout.css"; 

function CashierCheckout() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [pendingOrder, setPendingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchOrderToPay = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/orders/session/${sessionId}`);
        const ordersData = Array.isArray(res.data) ? res.data : [];
        const orderToPay = ordersData.find(order => order.paymentStatus === 'unpaid');
        setPendingOrder(orderToPay);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setPendingOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderToPay();
  }, [sessionId]);

  const handleCashPayment = async () => {
    if (!pendingOrder) {
      alert("No order available to pay.");
      return;
    }
    const isConfirmed = window.confirm(`Confirm cash payment of ${pendingOrder.totalAmount.toLocaleString("en-US")}₫?`);
    if (isConfirmed) {
      try {
        await axios.put(`http://localhost:8080/api/orders/${pendingOrder._id}/pay-by-cash`);
        alert("✅ Cash payment successful!");
        navigate('/cashier/tables');
      } catch (error) {
        console.error("Error during cash payment:", error);
        const message = error.response?.data?.message || "An error occurred.";
        alert(`❌ ${message}`);
      }
    }
  };

  const handleNavigateToPayment = () => {
    if (pendingOrder) {
      navigate('/payment-gateway', {
        state: {
          orderId: pendingOrder._id,
          amount: pendingOrder.totalAmount
        }
      });
    } else {
      alert("No unpaid order found to proceed with payment.");
    }
  };

  if (loading) return <div className="info-container">🔄 Loading order details...</div>;
  if (!sessionId) return <div className="info-container">⚠️ No session selected. Please go back to the tables view.</div>;
  
  return (
    <>
      <CashierHeader />
      <div className="cashier-checkout-container">
        <h2>🧾 Checkout - Session ID: {sessionId}</h2>

        {pendingOrder ? (
          <>
            <div key={pendingOrder._id} className="order-card">
              <h4>🕒 Order Time: {new Date(pendingOrder.orderTime).toLocaleString('en-US')}</h4>
              <p>
                Payment Status: 
                <span className={`payment-status ${pendingOrder.paymentStatus}`}>
                  {pendingOrder.paymentStatus.toUpperCase()}
                </span>
              </p>
              <ul className="order-items-list">
                {pendingOrder.items.map((item) => (
                  <li key={item._id}>
                    <span>🍽 {item.menuItemId?.name || "Unknown item"} × {item.quantity}</span>
                    <span>{item.price.toLocaleString("en-US")}₫</span>
                  </li>
                ))}
              </ul>
              <p className="total-amount">
                <strong>Total: {pendingOrder.totalAmount.toLocaleString("en-US")}₫</strong>
              </p>
            </div>

            <div className="action-buttons">
              <button
                onClick={handleCashPayment}
                className="btn-payment btn-cash"
              >
                💵 Pay with Cash
              </button>
              <button
                onClick={handleNavigateToPayment}
                className="btn-payment btn-zalo"
              >
                📲 Pay with QR Code
              </button>
            </div>
          </>
        ) : (
          <div className="info-container">
            <h3>🧺 No unpaid orders in this session.</h3>
            <p>The customer may have already paid, or no items have been ordered yet.</p>
            <button onClick={() => navigate('/cashier/tables')} className="btn-action">
              Back to Tables
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CashierCheckout;
