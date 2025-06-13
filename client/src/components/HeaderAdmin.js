import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

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
          }}
        >
                    <li><Link to="/admin/dashboard" style={navLinkStyle}>Dashboard</Link></li>
          <li><Link to="/admin/menu" style={navLinkStyle}>Thực đơn</Link></li>
          <li><Link to="/admin/tables" style={navLinkStyle}>Quản lý bàn</Link></li>
          <li><Link to="/admin/reservations" style={navLinkStyle}>Đặt bàn</Link></li>
          <li><Link to="/admin/orders" style={navLinkStyle}>Đơn hàng</Link></li>
          <li><Link to="/admin/staff" style={navLinkStyle}>Nhân viên</Link></li>
          <li><Link to="/admin/reports" style={navLinkStyle}>Báo cáo</Link></li>


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
