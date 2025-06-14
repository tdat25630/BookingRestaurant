// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useSession } from "../../../context/SessionContext";
// import Header from '../../Header/Header';
// import Button from '../../Button/Button';
// import { useNavigate } from "react-router-dom";



// function CheckoutPage() {
//   const { sessionId, clearSession } = useSession();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!sessionId) return;

//     axios.get(`http://localhost:8080/api/orders/session/${sessionId}`)
//       .then(res => setOrders(res.data))
//       .catch(err => console.error(" Lỗi khi lấy đơn hàng:", err))
//       .finally(() => setLoading(false));
//   }, [sessionId]);

//   const handleCash = () => {
//     alert("Bạn chọn thanh toán tiền mặt.");
//     handlePayment();
//   };
  
//   const handleQRCode = () => {
//     alert("Bạn chọn chuyển khoản qua QR.");
//     // Thêm xử lý sau, ví dụ redirect đến trang QR hoặc hiển thị ảnh QR Hưng làm nhé
//   };

  
//   const handlePayment = async () => {
//     try {
//       await Promise.all(
//         orders.map(order =>
//           axios.put(`http://localhost:8080/api/orders/${order._id}/status`, {
//             status: "paid",
//           })
//         )
//       );
//       alert("✅ Đã thanh toán!");
//       clearSession();
//       navigate("/"); // Quay về trang chủ hoặc hiển thị trang "Cảm ơn"
//     } catch (err) {
//       console.error("❌ Lỗi thanh toán:", err);
//       alert("Có lỗi khi thanh toán!");
//     }
//   };

//   if (!sessionId) return <p>⚠️ Chưa có phiên đặt bàn!</p>;
//   if (loading) return <p>Đang tải...</p>;

//   return (
//     <>
//       <Header />
//       <div className="checkout-container">
//         <h2>🧾 Hóa đơn hiện tại</h2>
//         {orders.map(order => (
//           <div key={order._id} className="order-card">
//             <h3>🕒 {new Date(order.orderTime).toLocaleString()}</h3>
//             <p>Trạng thái đơn hàng: <strong>{order.status}</strong></p>
//             <ul>
//               {order.items.map(item => (
//                 <li key={item._id}>
//                   {item.menuItemId?.name || 'Món không rõ'} × {item.quantity} — {item.price.toLocaleString('vi-VN') + '₫'}
//                   <span style={{ marginLeft: "10px", fontStyle: "italic" }}>
//                     [{item.status}]
//                   </span>
//                 </li>
//               ))}
//             </ul>
//             <p><strong>Tổng cộng: {order.totalAmount.toLocaleString()}₫</strong></p>
//           </div>
//         ))}
// <button onClick={() => navigate("/pay")}>💵 Thanh toán</button>




//       </div>
//     </>
//   );
// }

// export default CheckoutPage;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "../../../context/SessionContext";
import Header from "../../Header/Header";
import { useNavigate } from "react-router-dom";
import "./CheckoutPage.css"; // tạo CSS nếu cần

function CheckoutPage() {
  const { sessionId, clearSession } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) return;

    axios
      .get(`http://localhost:8080/api/orders/session/${sessionId}`)
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : [res.data]))
      .catch((err) => console.error("❌ Lỗi khi lấy đơn hàng:", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handlePayment = async (method) => {
    try {
      await Promise.all(
        orders.map((order) =>
          axios.put(`http://localhost:8080/api/orders/${order._id}/status`, {
            status: "paid",
          })
        )
      );
      alert(`✅ Đã thanh toán bằng ${method === "cash" ? "tiền mặt" : "QR Code"}!`);
      clearSession();
      navigate("/"); // hoặc navigate("/thank-you");
    } catch (err) {
      console.error("❌ Lỗi thanh toán:", err);
      alert("Có lỗi khi thanh toán!");
    }
  };

  if (!sessionId) return <p>⚠️ Chưa có phiên đặt bàn!</p>;
  if (loading) return <p>🔄 Đang tải đơn hàng...</p>;
  if (orders.length === 0)
    return (
      <div style={{ padding: "2rem" }}>
        <h3>🧺 Bạn chưa gửi đơn hàng nào.</h3>
        <button onClick={() => navigate(`/menu?sessionId=${sessionId}`)}>
          🍽 Gọi món ngay
        </button>
      </div>
    );

  return (
    <>
      <Header />
      <div className="checkout-container" style={{ padding: "2rem" }}>
        <h2>🧾 Hóa đơn của bạn</h2>

        {orders.map((order) => (
          <div key={order._id} className="order-card" style={{ marginBottom: "2rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
            <h4>🕒 {new Date(order.orderTime).toLocaleString()}</h4>
            <p>
              <strong>Trạng thái đơn:</strong>{" "}
              <span style={{ color: order.status === "paid" ? "green" : "orange" }}>
                {order.status}
              </span>
            </p>

            <ul style={{ paddingLeft: "1.2rem" }}>
              {order.items.map((item) => (
                <li key={item._id}>
                  🍽 {item.menuItemId?.name || "Không rõ"} × {item.quantity} —{" "}
                  {item.price.toLocaleString("vi-VN")}₫{" "}
                  <span style={{ fontStyle: "italic", marginLeft: 10 }}>
                    [{item.status}]
                  </span>
                </li>
              ))}
            </ul>

            <p>
              <strong>Tổng: </strong>
              {order.totalAmount?.toLocaleString("vi-VN") || 0}₫
            </p>
          </div>
        ))}

        <div style={{ marginTop: "2rem" }}>
          <button
            onClick={() => navigate(`/menu?sessionId=${sessionId}`)}
            style={{ marginRight: "1rem" }}
          >
            ➕ Gọi thêm món
          </button>
          {/* <button
            // onClick={() => handlePayment("cash")}
            style={{ marginRight: "1rem", backgroundColor: "#28a745", color: "white" }}
          >
            💵 Thanh toán tiền mặt
          </button>
          <button onClick={() => handlePayment("qr")} style={{ backgroundColor: "#007bff", color: "white" }}>
            📱 Thanh toán QR Code
          </button> */}

          {/* {showPaymentModal && ( */}
  <div className="payment-modal">
    <h3>Chọn phương thức thanh toán:</h3>
    <button onClick={() => {
      alert("💵 Chức năng thanh toán tiền mặt chưa được xử lý.");
    //   setShowPaymentModal(false);
    }}>
      💵 Tiền mặt
    </button>

    <button onClick={() => {
      alert("📲 Chức năng thanh toán bằng QR code chưa được xử lý.");
    //   setShowPaymentModal(false);
    }}>
      📲 QR Code
    </button>

    {/* <button onClick={() => setShowPaymentModal(false)}>❌ Huỷ</button> */}
  </div>
{/* )} */}

        </div>
      </div>
    </>
  );
}

export default CheckoutPage;
