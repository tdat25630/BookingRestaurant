// import React from "react";
// import { Link, useNavigate } from "react-router-dom";

// const Header = () => {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user"));

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   return (
//     <header
//       style={{
//         backgroundColor: "#007acc",
//         color: "white",
//         padding: "1rem 2rem",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
//       }}
//     >
//       {/* Logo */}
//       <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
//         <Link to="/" style={{ color: "white", textDecoration: "none" }}>
//           Hải Sản Việt Nam
//         </Link>
//       </div>

//       {/* Navigation Links */}
//       <nav>
//         <ul
//           style={{
//             listStyle: "none",
//             display: "flex",
//             gap: "1.5rem",
//             margin: 0,
//             padding: 0,
//           }}
//         >
//           <li>
//             <Link to="/about" style={navLinkStyle}>Giới thiệu</Link>
//           </li>
//           <li>
//             <Link to="/menu" style={navLinkStyle}>Thực đơn</Link>
//           </li>
//           <li>
//             <Link to="/space" style={navLinkStyle}>Không gian nhà hàng</Link>
//           </li>
//           <li>
//             <Link to="/booking" style={navLinkStyle}>Đặt bàn</Link>
//           </li>

//           {user ? (
//             <>
//               <li style={{ color: "white" }}>Chào, {user.username}</li>
//               <li>
//                 <button
//                   onClick={handleLogout}
//                   style={{
//                     background: "transparent",
//                     border: "1px solid white",
//                     borderRadius: "4px",
//                     padding: "0.3rem 0.7rem",
//                     color: "white",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Đăng xuất
//                 </button>
//               </li>
//             </>
//           ) : (
//             <li>
//               <Link to="/login" style={navLinkStyle}>Đăng nhập</Link>
//             </li>
//           )}
//         </ul>
//       </nav>
//     </header>
//   );
// };

// // Style for links
// const navLinkStyle = {
//   color: "white",
//   textDecoration: "none",
//   fontWeight: "500",
//   transition: "color 0.3s",
// };

// export default Header;

// src/components/Header.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrder } from "../context/OrderContext";
import CartDrawer from "./CartDrawer";

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const { cartItems } = useOrder();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header
      style={{
        backgroundColor: "#007acc",
        color: "white",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      {/* Logo */}
      <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          Hải Sản Việt Nam
        </Link>
      </div>

      {/* Navigation Links */}
      <nav>
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            gap: "1.5rem",
            margin: 0,
            padding: 0,
            alignItems: "center",
          }}
        >
          <li>
            <Link to="/about" style={navLinkStyle}>Giới thiệu</Link>
          </li>
          <li>
            <Link to="/menu" style={navLinkStyle}>Thực đơn</Link>
          </li>
          <li>
            <Link to="/space" style={navLinkStyle}>Không gian nhà hàng</Link>
          </li>
          <li>
            <Link to="/booking" style={navLinkStyle}>Đặt bàn</Link>
          </li>

<li> <button onClick={() => navigate("/checkout")}>Xem hóa đơn</button>
</li>
          <li>
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                background: "transparent",
                border: "1px solid white",
                borderRadius: "4px",
                padding: "0.3rem 0.7rem",
                color: "white",
                cursor: "pointer",
              }}
            >
              🛒 Giỏ hàng ({cartItems.length})
            </button>
          </li>

          {user ? (
            <>
              <li style={{ color: "white" }}>Chào, {user.username}</li>
              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "transparent",
                    border: "1px solid white",
                    borderRadius: "4px",
                    padding: "0.3rem 0.7rem",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Đăng xuất
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" style={navLinkStyle}>Đăng nhập</Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Cart Drawer Component */}
      <CartDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
};

// Style for links
const navLinkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "500",
  transition: "color 0.3s",
};

export default Header;
