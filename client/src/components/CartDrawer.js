// // src/components/CartDrawer.js
// import React from "react";
// import { useOrder } from "../context/OrderContext";
// import { Link } from "react-router-dom";
// import "./CartDrawer.css"; // tạo file CSS kèm theo

// function CartDrawer({ isOpen, onClose }) {
//   const { cartItems, clearCart } = useOrder();

//   const total = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   return (
//     <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
//       <div className="cart-header">
//         <h3>🛒 Giỏ hàng</h3>
//         <button className="close-btn" onClick={onClose}>✕</button>
//       </div>
//       <div className="cart-body">
//         {cartItems.length === 0 ? (
//           <p>Giỏ hàng trống</p>
//         ) : (
//           <ul>
//             {cartItems.map(item => (
//               <li key={item._id}>
//                 {item.name} x {item.quantity} - {item.price * item.quantity}₫
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//       <div className="cart-footer">
//         <p><strong>Tổng:</strong> {total}₫</p>
//         <Link to="/checkout">
//           <button onClick={onClose}>Thanh toán</button>
//         </Link>
//         <button className="clear-btn" onClick={clearCart}>Xóa hết</button>
//       </div>
//     </div>
//   );
// }

// export default CartDrawer;


// import React from "react";
// import { useOrder } from "../context/OrderContext";
// import { Link } from "react-router-dom";
// import "./CartDrawer.css";

// function CartDrawer({ isOpen, onClose }) {
//   const { cartItems, clearCart, increaseQuantity, decreaseQuantity, updateNote } = useOrder();

//   const total = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   return (
//     <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
//       <div className="cart-header">
//         <h3>🛒 Giỏ hàng</h3>
//         <button className="close-btn" onClick={onClose}>✕</button>
//       </div>
//       <div className="cart-body">
//         {cartItems.length === 0 ? (
//           <p>Giỏ hàng trống</p>
//         ) : (
//           <ul>
//             {cartItems.map(item => (
//               <li key={item._id} className="cart-item">
//                 <div className="item-info">
//                   <span>{item.name}</span>
//                   <div className="quantity-control">
//                     <button onClick={() => decreaseQuantity(item._id)}>-</button>
//                     <span>{item.quantity}</span>
//                     <button onClick={() => increaseQuantity(item._id)}>+</button>
//                   </div>
//                   <div>{item.price * item.quantity}₫</div>
//                 </div>
            
//                  <input
//             type="text"
//             placeholder="Ghi chú"
//             value={item.notes || ""}
//             onChange={(e) => updateNote(item._id, e.target.value)}
//           />
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//       <div className="cart-footer">
//         <p><strong>Tổng:</strong> {total}₫</p>
//         <Link to="/checkout">
//           <button onClick={onClose}>Gửi order</button>
//         </Link>
//         <button className="clear-btn" onClick={clearCart}>Xóa hết</button>
//       </div>
//     </div>
//   );
// }

// export default CartDrawer;


import React, { useState } from "react";
import { useOrder } from "../context/OrderContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ConfirmationModal from "./ConfirmationModal";
import "./CartDrawer.css";

function CartDrawer({ isOpen, onClose }) {
  const { cartItems, clearCart, increaseQuantity, decreaseQuantity, updateNote } = useOrder();
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSendOrder = async () => {
    const orderData = {
      tableId: "TABLE_ID_HERE",
      orderItems: cartItems.map(item => ({
        menuItemId: item._id,
        quantity: item.quantity,
        notes: item.notes || "",
        price: item.price
      }))
    };

    try {
      await axios.post("/api/orders", orderData);
      alert("Đơn hàng đã được gửi tới admin!");
      clearCart();
      onClose(); // Đóng cart
      navigate("/checkout"); // Chuyển sang trang checkout
    } catch (err) {
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
          <p><strong>Tổng:</strong> {total}₫</p>
          <button onClick={() => { console.log("🧪 [LOG] Nút Gửi Order đã được nhấn!"); 
            setShowConfirm(true)}}>Gửi order</button>
          <button className="clear-btn" onClick={clearCart}>Xóa hết</button>
        </div>
      </div>

      {/* Modal xác nhận */}

      {/* <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSendOrder}
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
    </>
  );
}

export default CartDrawer;
