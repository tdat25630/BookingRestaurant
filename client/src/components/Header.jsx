import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
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
          <li>
            <Link to="/login" style={navLinkStyle}>Đăng nhập</Link>
          </li>
        </ul>
      </nav>
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
