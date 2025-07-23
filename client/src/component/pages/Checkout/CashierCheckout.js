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

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [linkingMessage, setLinkingMessage] = useState({ type: "", text: "" });

  const fetchOrderToPay = async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8080/api/orders/session/${sessionId}`
      );
      const ordersData = Array.isArray(res.data) ? res.data : [];
      const orderToPay = ordersData.find(
        (order) => order.paymentStatus === "unpaid"
      );
      setPendingOrder(orderToPay);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setPendingOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderToPay();
  }, [sessionId]);

  const handleSearchUser = async () => {
    if (!userSearchQuery) return;
    setIsSearching(true);
    setLinkingMessage({ type: "", text: "" });
    setFoundUser(null);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/user/search?q=${userSearchQuery}`
      );
      if (res.data.success && res.data.user) {
        setFoundUser(res.data.user);
      }
    } catch (error) {
      setLinkingMessage({ type: "error", text: "Không tìm thấy thành viên." });
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkUserToOrder = async () => {
    if (!foundUser || !pendingOrder) return;
    try {
      const res = await axios.put(
        `http://localhost:8080/api/orders/${pendingOrder._id}/link-user`,
        {
          userId: foundUser._id,
        }
      );
  
  
      setPendingOrder(res.data.order);
      setLinkingMessage({
        type: "success",
        text: `Đã gán đơn hàng cho ${foundUser.username}`,
      });
      setFoundUser(null);
      setUserSearchQuery("");
    } catch (error) {
      setLinkingMessage({ type: "error", text: "Lỗi khi gán đơn hàng." });
    }
  };
  const addPointsForOrder = async (order) => {
    if (!order.userId) {
      console.log("Đơn hàng không có thông tin user, bỏ qua việc cộng điểm.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8080/api/promotions/addpointsAfterPayment",
        {
          userId:
            typeof order.userId === "object" ? order.userId._id : order.userId,
          totalAmount: order.totalAmount,
        }
      );
      console.log("Cộng điểm thành công.");
    } catch (pointError) {
      console.warn(
        "⚠️ Đã có lỗi xảy ra khi cộng điểm:",
        pointError.response?.data || pointError.message
      );
    }
  };

  const handleCashPayment = async () => {
    if (!pendingOrder) return alert("Không có đơn hàng để thanh toán.");
    const isConfirmed = window.confirm(
      `Xác nhận thanh toán tiền mặt ${pendingOrder.totalAmount.toLocaleString(
        "en-US"
      )}₫?`
    );
    if (isConfirmed) {
      try {
        await axios.put(
          `http://localhost:8080/api/orders/${pendingOrder._id}/pay-by-cash`
        );
        await addPointsForOrder(pendingOrder);
        alert("✅ Thanh toán tiền mặt thành công!");
        navigate("/cashier/tables");
      } catch (error) {
        alert(`❌ ${error.response?.data?.message || "Đã có lỗi xảy ra."}`);
      }
    }
  };

  const handleNavigateToPayment = () => {
    if (pendingOrder) {
      navigate("/payment-gateway", {
        state: {
          orderId: pendingOrder._id,
          amount: pendingOrder.totalAmount,
        },
      });
    }
  };

  if (loading)
    return <div className="info-container">🔄 Đang tải...</div>;
  if (!sessionId)
    return (
      <div className="info-container">
        ⚠️ Chưa chọn phiên. Vui lòng quay lại và chọn bàn.
      </div>
    );

  return (
    <>
      <CashierHeader />
      <div className="cashier-checkout-container">
        <h2>🧾 Thanh toán - Phiên: {sessionId}</h2>
        {pendingOrder ? (
          <>
            <div key={pendingOrder._id} className="order-card">
              <h4>
                🕒 Thời gian đặt:{" "}
                {new Date(pendingOrder.orderTime).toLocaleString("en-US")}
              </h4>
              <p>
                Trạng thái:
                <span className={`payment-status ${pendingOrder.paymentStatus}`}>
                  {pendingOrder.paymentStatus.toUpperCase()}
                </span>
              </p>
              <ul className="order-items-list">
              {pendingOrder.items?.map((item) => (
                  <li key={item._id}>
                    <span>
                      🍽️ {item.menuItemId?.name || "Sản phẩm không rõ"} ×{" "}
                      {item.quantity}
                    </span>
                    <span>{item.price.toLocaleString("en-US")}₫</span>
                  </li>
                ))}
              </ul>
              <p className="total-amount">
                <strong>
                  Tổng cộng: {pendingOrder.totalAmount.toLocaleString("en-US")}₫
                </strong>
              </p>
            </div>

            <div className="member-linking-section">
              <h4>Tích điểm thành viên</h4>
              {pendingOrder.userId ? (
                <div className="member-linked-info">
                  <p>
                    ✅ Đơn hàng sẽ tích điểm cho:{" "}
                    <strong>{pendingOrder.userId.username}</strong>
                  </p>
                </div>
              ) : (
                <>
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder=", Email của khách..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      disabled={isSearching}
                    />
                    <button
                      onClick={handleSearchUser}
                      disabled={isSearching || !userSearchQuery}
                    >
                      {isSearching ? "Đang tìm..." : "Tìm"}
                    </button>
                  </div>
                  {linkingMessage.text && (
                    <p
                      className={`linking-message ${linkingMessage.type}`}
                    >
                      {linkingMessage.text}
                    </p>
                  )}
                  {foundUser && (
                    <div className="found-user-card">
                      <p>
                        <strong>Tên:</strong> {foundUser.username}
                      </p>
                      <p>
                        <strong>Điểm hiện tại:</strong> {foundUser.points}
                      </p>
                      <button
                        onClick={handleLinkUserToOrder}
                        className="btn-link-user"
                      >
                        Gán vào đơn hàng này
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="action-buttons">
              <button
                onClick={handleCashPayment}
                className="btn-payment btn-cash"
              >
                💵 Thanh toán tiền mặt
              </button>
              <button
                onClick={handleNavigateToPayment}
                className="btn-payment btn-zalo"
              >
                📲 Thanh toán bằng mã QR
              </button>
            </div>
          </>
        ) : (
          <div className="info-container">
            <h3>🧺 Không có đơn hàng nào cần thanh toán.</h3>
            <button
              onClick={() => navigate("/cashier/tables")}
              className="btn-action"
            >
              Quay lại danh sách bàn
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CashierCheckout;