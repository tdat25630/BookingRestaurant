import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import CashierHeader from "../../Header/CashierHeader";
// It's good practice to have a separate CSS file for styling
import "./CashierCheckout.css"; 

function CashierCheckout() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [pendingOrder, setPendingOrder] = useState(null); // State to store only the order that needs to be paid
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // This useEffect is optimized to find and store only the order that needs to be paid
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchOrderToPay = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/orders/session/${sessionId}`);
        const ordersData = Array.isArray(res.data) ? res.data : [];
        
        // Find the single order with 'unpaid' status
        const orderToPay = ordersData.find(order => order.paymentStatus === 'unpaid');
        
        setPendingOrder(orderToPay); // Store this order (it will be null if not found)

      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setPendingOrder(null); // Ensure no order is displayed in case of an error
      } finally {
        setLoading(false);
      }
    };

    fetchOrderToPay();
  }, [sessionId]);

  // Navigate to the ZaloPay payment gateway page
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

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>🔄 Loading order details...</div>;
  if (!sessionId) return <div style={{ padding: "2rem", textAlign: "center" }}>⚠️ No session selected. Please go back to the tables view.</div>;
  
  return (
    <>
      <CashierHeader />
      <div className="container" style={{ padding: "20px" }}>
        <h2>🧾 Checkout - Session ID: {sessionId}</h2>

        {pendingOrder ? (
          // If there is an order to pay, display its details and buttons
          <>
            <div key={pendingOrder._id} className="order-card" style={{ marginBottom: "20px", background: "#fff", padding: "15px", borderRadius: "10px", boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h4>🕒 Order Time: {new Date(pendingOrder.orderTime).toLocaleString('en-US')}</h4>
              <p>
                Payment Status: 
                <strong style={{ color: pendingOrder.paymentStatus === 'unpaid' ? '#db5b1d' : '#28a745' }}>
                  {pendingOrder.paymentStatus.toUpperCase()}
                </strong>
              </p>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {/* Display the items of the order to be paid */}
                {pendingOrder.items.map((item) => (
                  <li key={item._id} style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                    🍽 {item.menuItemId?.name || "Unknown item"} × {item.quantity} —{" "}
                    {item.price.toLocaleString("en-US")}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'right', marginTop: '1rem' }}>
                <strong>Total: {pendingOrder.totalAmount.toLocaleString("en-US")}</strong>
              </p>
            </div>

            <div className="action-buttons" style={{ marginTop: "2rem", display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => alert('Cash payment functionality is under development.')}
                className="btn-payment btn-cash"
                title="Functionality under development"
                style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                💵 Pay with Cash
              </button>
              <button
                onClick={handleNavigateToPayment}
                className="btn-payment btn-zalo"
                style={{ padding: '10px 20px', background: '#005baa', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                📲 Pay with QR Code
              </button>
            </div>
          </>
        ) : (
          // If there are no orders to pay, display a message
          <div style={{ padding: "2rem", textAlign: "center", background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>🧺 No unpaid orders in this session.</h3>
            <p>The customer may have already paid, or no items have been ordered yet.</p>
            <button onClick={() => navigate('/cashier/tables')} style={{ padding: '10px 20px', marginTop: '1rem', cursor: 'pointer' }}>
              Back to Tables
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CashierCheckout;
