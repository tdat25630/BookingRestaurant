import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/menu")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch menu");
        return res.json();
      })
      .then((data) => {
        setMenuCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleAddToList = (item) => {
    alert(`Bạn đã thêm "${item.name}" vào danh sách!`);
  };

  // Gom tất cả món có isAvailable = true lại, lấy 6 món đầu tiên để hiển thị
  // const allAvailableItems = menuCategories
  //   .flatMap(category => category.items || [])
  //   .filter(item => item.isAvailable)
  //   .slice(0, 6);
  const allAvailableItems = menuCategories
  .filter(item => item.isAvailable)
  .slice(0, 6);

  
  const handleViewMore = () => {
    navigate('/menu')
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: "3rem" }}>Đang tải dữ liệu...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>Lỗi: {error}</p>;

  return (
    <>
      <Header />
      {/* Banner + lời chào */}
      <div
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1350&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "5rem 2rem",
          color: "white",
          textAlign: "center",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          boxShadow: "inset 0 0 0 1000px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", fontWeight: "bold" }}>
          Chào mừng tới Nhà hàng Hải sản Việt Nam
        </h1>
        <p style={{ fontSize: "1.25rem" }}>Thưởng thức những món hải sản tươi ngon nhất!</p>
      </div>

      {/* Thực đơn */}
      <div
        style={{
          padding: "2rem",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          minHeight: "60vh",
          backgroundColor: "#fdfdfd",
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#d62828", fontSize: "2rem", marginBottom: "2rem" }}>
          Thực Đơn
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {allAvailableItems.map((item) => (
            <div
              key={item._id}
              style={{
                border: "1px solid #eee",
                borderRadius: "10px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                padding: "1rem",
                transition: "transform 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  marginBottom: "0.75rem",
                }}
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80")
                }
              />
              <h3 style={{ margin: "0.5rem 0", color: "#264653" }}>{item.name}</h3>
              <p style={{ fontSize: "0.9rem", color: "#555", minHeight: "3em" }}>{item.description}</p>
              <p style={{ fontWeight: "bold", color: "#2a9d8f" }}>
                {item.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </p>
              <button
                style={{
                  marginTop: "0.75rem",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#2a9d8f",
                  color: "#fff",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={() => handleAddToList(item)}
              >
                Thêm vào danh sách
              </button>
            </div>
          ))}
        </div>

        {/* Nút Xem thêm chung */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            onClick={handleViewMore}
            style={{
              backgroundColor: "#d62828",
              color: "white",
              padding: "0.75rem 2rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1.1rem",
              fontWeight: "bold",
            }}
          >
            Xem thêm
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;
