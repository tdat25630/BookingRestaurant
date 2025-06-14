import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import AdminHeader from "../../Header/AdminHeader";
import { useNavigate } from 'react-router-dom';

function AdminCheckoutPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) return;

    axios
      .get(`http://localhost:8080/api/orders/session/${sessionId}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to fetch orders:", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handlePayment = async () => {
    try {
      await Promise.all(
        orders.map((order) =>
          axios.put(`http://localhost:8080/api/orders/${order._id}/status`, {
            status: "paid",
          })
        )
      );
      await axios.put(`http://localhost:8080/api/dining-sessions/${sessionId}/complete`);
      alert(" Payment successful & session ended!");
      navigate("/admin/tables");
    } catch (err) {
      console.error("Payment error:", err);
      alert(" Failed to complete payment!");
    }
  };

  if (!sessionId) return <p> No session selected.</p>;
  if (loading) return <p>Loading orders...</p>;

  return (
    <>
      <AdminHeader />
      <div className="container" style={{ padding: "20px" }}>
        <h2>🧾 Checkout - Session ID: {sessionId}</h2>

        {orders.map((order) => (
          <div key={order._id} className="order-card" style={{ marginBottom: "20px", background: "#fff", padding: "15px", borderRadius: "10px" }}>
            <h4>🕒 {new Date(order.orderTime).toLocaleString()}</h4>
            <p>Status: <strong>{order.status}</strong></p>
            <ul>
              {order.items.map((item) => (
                <li key={item._id}>
                  {item.menuItemId?.name || "Unknown item"} × {item.quantity} —{" "}
                  {item.price.toLocaleString("vi-VN")}₫
                  <span style={{ marginLeft: "10px", fontStyle: "italic" }}>
                    [{item.status}]
                  </span>
                </li>
              ))}
            </ul>
            <p><strong>Total: {order.totalAmount.toLocaleString("vi-VN")}₫</strong></p>
          </div>
        ))}

        <button
        //   onClick={handlePayment}
        //   className="button-primary"
        //   style={{ marginTop: "20px" }}
        >
          💳 Confirm Payment 
        </button>
      </div>
    </>
  );
}

export default AdminCheckoutPage;
