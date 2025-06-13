import React, { useEffect } from "react";
import "./ConfirmationModal.css";

function ConfirmationModal({ isOpen, onClose, onConfirm, cartItems }) {
  useEffect(() => {
    if (isOpen) {
      console.log("🧪 [LOG] Modal xác nhận đã mở!");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Xác nhận đơn hàng</h3>
        <ul>
          {cartItems.map((item) => (
            <li key={item._id}>
              {item.name} x {item.quantity} - {item.price * item.quantity}₫
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button onClick={onConfirm}>Xác nhận & Gửi</button>
          <button onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </div>
  );


}

export default ConfirmationModal;
