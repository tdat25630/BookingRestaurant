import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "../../../context/SessionContext";
import Header from "../../Header/Header";
import { useNavigate } from "react-router-dom";
import "./CheckoutPage.css"; 

function CheckoutPage() {
  const { sessionId } = useSession();
  const [pendingOrder, setPendingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/orders/session/${sessionId}`);
        const orderToPay = Array.isArray(res.data) 
          ? res.data.find(order => order.paymentStatus === 'unpaid') 
          : null;
        setPendingOrder(orderToPay);
      } catch (err) {
        console.error("❌ Lỗi khi lấy đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId]);

  const handleNavigateToPayment = () => {
    if (pendingOrder) {
      navigate('/payment-gateway', { 
        state: { 
          orderId: pendingOrder._id, 
          amount: pendingOrder.totalAmount 
        } 
      });
    } else {
      alert("Không tìm thấy đơn hàng nào cần thanh toán.");
    }
  };

  if (loading) return <div className="loading-container">🔄 Đang tải đơn hàng...</div>;
  if (!sessionId) return <div className="info-container">⚠️ Chưa có phiên đặt bàn!</div>;
  if (!pendingOrder) {
    return (
      <>
        <Header />
        <div className="info-container">
          <h3>🧺 Bạn không có đơn hàng nào cần thanh toán.</h3>
          <button onClick={() => navigate(`/menu?sessionId=${sessionId}`)} className="btn-action">
            🍽 Gọi món ngay
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-container">
        <h2>🧾 Hóa đơn của bạn</h2>
        <div key={pendingOrder._id} className="order-card">
          <h4>🕒 {new Date(pendingOrder.orderTime).toLocaleString('vi-VN')}</h4>
          <p>
            <strong>Trạng thái thanh toán:</strong>{" "}
            <span className={`status-${pendingOrder.paymentStatus}`}>
              {pendingOrder.paymentStatus === 'unpaid' ? 'Chưa thanh toán' : 'Đã thanh toán'}
            </span>
          </p>

          <ul className="order-items-list">
            {pendingOrder.items.map((item) => (
              <li key={item._id}>
                🍽 {item.menuItemId?.name || "Không rõ"} × {item.quantity} —{" "}
                {item.price.toLocaleString("vi-VN")}₫
              </li>
            ))}
          </ul>

          <p className="total-amount">
            <strong>Tổng cộng: </strong>
            {pendingOrder.totalAmount?.toLocaleString("vi-VN") || 0}₫
          </p>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate(`/menu?sessionId=${sessionId}`)} className="btn-action">
            ➕ Gọi thêm món
          </button>
          {/* <button 
            onClick={() => alert('Chức năng thanh toán bằng tiền mặt đang được phát triển.')} 
            className="btn-payment btn-cash"
            title="Chức năng đang phát triển"
          >
            💵 Thanh toán tiền mặt
          </button>
          <button 
            onClick={handleNavigateToPayment} 
            className="btn-payment btn-zalo"
          >
            📲 Thanh toán qua QR
          </button> */}
        </div>
      </div>
    </>
  );
}

export default CheckoutPage;
