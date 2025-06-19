import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "../../../context/SessionContext";
import Header from "../../Header/Header";
import { useNavigate } from "react-router-dom";
import VnpayQrModal from '../VnpayQrModal/VnpayQrModal';
import "./CheckoutPage.css";

// --- Component CheckoutPage chính ---
function CheckoutPage() {
  const { sessionId } = useSession();
  const [allItems, setAllItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8080/api/orders/session/${sessionId}`)
      .then((res) => {
        const orders = Array.isArray(res.data) ? res.data : [];
        const unpaidItems = orders
          .filter(o => o.paymentStatus === 'unpaid')
          .flatMap(o => o.items);

        if (unpaidItems.length > 0) {
          setAllItems(unpaidItems);
          const total = orders
            .filter(o => o.paymentStatus === 'unpaid')
            .reduce((sum, order) => sum + order.totalAmount, 0);
          setGrandTotal(total);

          const pendingOrder = orders.find(o => o.status === 'pending');
          if (pendingOrder) {
            setPendingOrderId(pendingOrder._id);
          }
        }
      })
      .catch((err) => console.error("❌ Lỗi khi lấy đơn hàng:", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleQrPaymentClick = () => {
    if (!pendingOrderId) {
      alert("Không tìm thấy đơn hàng nào cần xử lý để thanh toán. Vui lòng thử lại.");
      return;
    }
    setShowQrModal(true);
  };
  
  if (loading) return <p className="status-message">🔄 Đang tải hóa đơn...</p>;

  if (allItems.length === 0) {
    return (
      <div className="checkout-container empty">
        <h3>🧺 Hóa đơn của bạn trống.</h3>
        <p>Vui lòng gọi món để thanh toán.</p>
        <button onClick={() => navigate(`/menu?sessionId=${sessionId}`)}>
          🍽 Quay lại gọi món
        </button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-container">
        <h2>🧾 Hóa đơn tổng hợp</h2>

        <div className="invoice-card">
          <h4>Chi tiết các món đã gọi</h4>
          <ul className="invoice-item-list">
            {allItems.map((item, index) => (
              <li key={`${item._id}-${index}`} className="invoice-item">
                <span className="item-details">
                  {item.menuItemId?.name || "Không rõ"} × {item.quantity}
                </span>
                <span className="item-price">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </span>
              </li>
            ))}
          </ul>
          <hr />
          <div className="invoice-total">
            <strong>Tổng cộng:</strong>
            <strong>{grandTotal.toLocaleString("vi-VN")}₫</strong>
          </div>
        </div>

        <div className="payment-actions">
          <h3>Chọn phương thức thanh toán:</h3>
          <button
            onClick={() => navigate(`/menu?sessionId=${sessionId}`)}
            className="btn-add-more"
          >
            ➕ Gọi thêm món
          </button>
          <button 
            className="btn-pay btn-cash" 
            onClick={() => alert("Chức năng thanh toán tiền mặt đang được phát triển.")}
          >
            💵 Tiền mặt
          </button>
          <button 
            className="btn-pay btn-qr" 
            onClick={handleQrPaymentClick}
          >
            📱 Thanh toán QR Code
          </button>
        </div>
      </div>
      
      {showQrModal && (
        <VnpayQrModal
          orderId={pendingOrderId}
          totalAmount={grandTotal}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </>
  );
}

export default CheckoutPage;