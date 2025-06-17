import React, { useState } from "react";
import { useOrder } from "../context/OrderContext";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import ConfirmationModal from "./ConfirmationModal"; // điều chỉnh đường dẫn nếu khác

import "./CartDrawer.css";

import { useSession } from "../context/SessionContext"; // đường dẫn đúng theo dự án của bạn


function CartDrawer({ isOpen, onClose }) {
  const { sessionId } = useSession();
  const { cartItems, clearCart, increaseQuantity, decreaseQuantity, updateNote } = useOrder();
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

 

  const handleSendOrder = async () => {

  const orderData = {
    sessionId: sessionId, // lấy từ context
    items: cartItems.map(item => ({
      menuItemId: item._id,
      quantity: item.quantity,
      notes: item.notes || "",
      price: item.price
    }))
  };
  if (!sessionId) {
    alert("Chưa có session! Vui lòng chọn bàn hoặc tạo session trước khi gọi món.");
    return;
  }
  
  
  //   try {
  //     // await axios.post("/api/orders", orderData);
  //     await axios.post("http://localhost:8080/api/orders", orderData);
  //     console.log("🧪 [LOG] Gửi order với dữ liệu:", orderData);

  //     alert("Đơn hàng đã được gửi tới admin!");
  //     clearCart();
  //     onClose(); // Đóng cart
  //     navigate("/checkout"); // Chuyển sang trang checkout
  //   } catch (err) {
  //     alert("Lỗi khi gửi đơn hàng!");
  //   }
  // };
  try {
    const res = await axios.post("http://localhost:8080/api/orders", orderData);
    console.log("✅ [LOG] Đáp ứng từ backend:", res.data);
    alert("Đơn hàng đã được gửi tới admin!");
    clearCart();
    onClose();
    navigate("/checkout");
  } catch (err) {
    console.error("❌ [ERROR] Lỗi khi gửi đơn hàng:", err.response?.data || err.message);
    alert("Lỗi khi gửi đơn hàng!");
  }
  };  
  return (
    <>
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h3>🛒 Giỏ hàng</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <p>Giỏ hàng trống</p>
          ) : (
            <ul>
              {cartItems.map(item => (
                <li key={item._id} className="cart-item">
                  <div className="item-info">
                    <span>{item.name}</span>
                    <div className="quantity-control">
                      <button onClick={() => decreaseQuantity(item._id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item._id)}>+</button>
                    </div>
                    <div>{item.price * item.quantity}₫</div>
                  </div>
                  <input
                    type="text"
                    placeholder="Ghi chú"
                    value={item.notes || ""}
                    onChange={(e) => updateNote(item._id, e.target.value)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
         <div className="cart-footer">
        
         {/* <p><strong>Tổng:</strong> {total}₫</p>
        //  <button onClick={() => { console.log("🧪 [LOG] Nút Gửi Order đã được nhấn!"); 
         //   setShowConfirm(true)}}>Gửi order</button>
        //  <button className="clear-btn" onClick={clearCart}>Xóa hết</button> */}


          <button
  onClick={() => {
    console.log("🧪 [LOG] Nút Gửi Order đã được nhấn!");
    navigate("/confirm");
  }}
>
  Gửi order
</button>
<button className="clear-btn" onClick={clearCart}>Xóa hết</button>
        </div>
     

      {/* Modal xác nhận */}

      {/* <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSendOrder}
        cartItems={cartItems}
      /> */}

{/* <ConfirmationModal
  isOpen={true}
  onClose={() => console.log("close modal")}
  onConfirm={() => console.log("confirm order")}
  cartItems={cartItems}
/> */}

{showConfirm && (
  <ConfirmationModal
    isOpen={showConfirm}
    onClose={() => setShowConfirm(false)}
    onConfirm={handleSendOrder}
    cartItems={cartItems}
  />
)}
 </div>
    </>
  );
}

export default CartDrawer;
