// import React from "react";
// import { useOrder } from "../../context/OrderContext";
// import axios from "axios";

// function CheckoutPage() {
//   const { cartItems, clearCart } = useOrder();

//   const handleCheckout = async () => {
//     const orderData = {
//       tableId: "TABLE_ID_HERE", // bạn sẽ cập nhật sau khi làm QR
//     //   orderItems: cartItems.map(item => ({
//     //     menuItemId: item.menuItem._id,
//     //     quantity: item.quantity,
//     //     notes: item.notes || "",
//     //     price: item.menuItem.price
//     //   }))
//     orderItems: cartItems.map(item => ({
//         menuItemId: item._id,
//         quantity: item.quantity,
//         notes: item.notes || "",
//         price: item.price
//       }))
      
//     };

//     try {
//       await axios.post("/api/orders", orderData);
//       alert("Gửi đơn hàng thành công!");
//       clearCart();
//     } catch (err) {
//       alert("Lỗi gửi đơn hàng.");
//     }
//   };

//   return (
//     <div>
//       <h2>Xác nhận đơn</h2>
//       {/* <ul>
//         {cartItems.map(({ menuItem, quantity }) => (
//           <li key={menuItem._id}>{menuItem.name} x {quantity}</li>
//         ))}
//       </ul> */}
//       <ul>
//   {cartItems.map(item => (
//     <li key={item._id}>{item.name} x {item.quantity}</li>
//   ))}
// </ul>
//       <button onClick={handleCheckout}>Gửi đơn hàng</button>
//     </div>
//   );
// }

// export default CheckoutPage;


import React from "react";
import { useOrder } from "../../context/OrderContext";
import { Link } from "react-router-dom";

function CheckoutPage() {
  const { cartItems } = useOrder(); // cart có thể đã bị clear, nên đây chỉ là tham khảo

  return (
    <div>
      <h2>Đơn hàng đã gửi</h2>
      <ul>
        {cartItems.length > 0 ? (
          cartItems.map(item => (
            <li key={item._id}>{item.name} x {item.quantity}</li>
          ))
        ) : (
          <li>Đơn hàng đã được gửi!</li>
        )}
      </ul>

      <div style={{ marginTop: "20px" }}>
        <Link to="/menu">🔄 Gọi thêm món</Link> | 
        <Link to="/payment">💳 Thanh toán</Link>
      </div>
    </div>
  );
}

export default CheckoutPage;
