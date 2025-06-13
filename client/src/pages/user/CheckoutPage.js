import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "../../context/SessionContext";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";



function CheckoutPage() {
  const { sessionId, clearSession } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) return;

    axios.get(`http://localhost:8080/api/orders/session/${sessionId}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error("❌ Lỗi khi lấy đơn hàng:", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleCash = () => {
    alert("Bạn chọn thanh toán tiền mặt.");
    handlePayment();
  };
  
  const handleQRCode = () => {
    alert("Bạn chọn chuyển khoản qua QR.");
    // Thêm xử lý sau, ví dụ redirect đến trang QR hoặc hiển thị ảnh QR Hưng làm nhé
  };

  
  const handlePayment = async () => {
    try {
      // Gọi API cập nhật trạng thái từng đơn là đã thanh toán
      await Promise.all(
        orders.map(order =>
          axios.put(`http://localhost:8080/api/orders/${order._id}/status`, {
            status: "paid",
          })
        )
      );
      alert("✅ Đã thanh toán!");
      clearSession();
      navigate("/"); // Quay về trang chủ hoặc hiển thị trang "Cảm ơn"
    } catch (err) {
      console.error("❌ Lỗi thanh toán:", err);
      alert("Có lỗi khi thanh toán!");
    }
  };

  if (!sessionId) return <p>⚠️ Chưa có phiên đặt bàn!</p>;
  if (loading) return <p>Đang tải...</p>;

  return (
    <>
      <Header />
      <div className="checkout-container">
        <h2>🧾 Hóa đơn hiện tại</h2>
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <h3>🕒 {new Date(order.orderTime).toLocaleString()}</h3>
            <p>Trạng thái đơn hàng: <strong>{order.status}</strong></p>
            <ul>
              {order.items.map(item => (
                <li key={item._id}>
                  {item.menuItemId?.name || 'Món không rõ'} × {item.quantity} — {item.price.toLocaleString('vi-VN') + '₫'}
                  <span style={{ marginLeft: "10px", fontStyle: "italic" }}>
                    [{item.status}]
                  </span>
                </li>
              ))}
            </ul>
            <p><strong>Tổng cộng: {order.totalAmount.toLocaleString()}₫</strong></p>
          </div>
        ))}
<button onClick={() => navigate("/pay")}>💵 Thanh toán</button>




      </div>
    </>
  );
}

export default CheckoutPage;
