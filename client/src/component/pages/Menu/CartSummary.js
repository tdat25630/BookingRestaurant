import React from "react";
import { useOrder } from "../context/OrderContext";

function CartSummary() {
  const { cartItems, removeFromCart } = useOrder();

  return (
    <div>
      <h3>Giỏ hàng</h3>
      {cartItems.length === 0 ? <p>Chưa có món nào</p> : (
        <ul>
          {cartItems.map(({ menuItem, quantity }) => (
            <li key={menuItem._id}>
              {menuItem.name} x {quantity}
              <button onClick={() => removeFromCart(menuItem._id)}>Xóa</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CartSummary;
