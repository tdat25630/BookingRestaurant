import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Menu = () => {
  const [menuCategories, setMenuCategories] = useState([]); // Mảng category có kèm items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/menu")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch menu");
        return res.json();
      })
      .then((data) => {
        // data: mảng món ăn, mỗi món có category object
        const categoriesMap = new Map();

        data.forEach((item) => {
          const cat = item.category;
          if (!categoriesMap.has(cat._id)) {
            categoriesMap.set(cat._id, {
              ...cat,
              items: [],
            });
          }
          categoriesMap.get(cat._id).items.push(item);
        });

        setMenuCategories(Array.from(categoriesMap.values()));
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

  const scrollToCategory = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <>
      <Header />
      <div style={{ padding: "2rem", minHeight: "80vh" }}>
        <h1
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            color: "#007acc",
          }}
        >
          Menu Nhà Hàng Hải Sản Việt Nam
        </h1>

        {/* --- DANH MỤC --- */}
        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          {menuCategories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => scrollToCategory(cat._id)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f1f1f1",
                border: "1px solid #007acc",
                borderRadius: "6px",
                color: "#007acc",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* --- MENU THEO CATEGORY --- */}
        {menuCategories.map((category) => (
          <section
            key={category._id}
            id={category._id}
            style={{ marginBottom: "4rem" }}
          >
            <h2
              style={{
                borderBottom: "2px solid #007acc",
                paddingBottom: "0.5rem",
                color: "#004080",
              }}
            >
              {category.name}
            </h2>
            <p style={{ fontStyle: "italic", color: "#666" }}>
              {category.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.5rem",
                marginTop: "1rem",
              }}
            >
              {category.items
                .filter((item) => item.isAvailable)
                .map((item) => (
                  <div
                    key={item._id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "1rem",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      backgroundColor: "#fff",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
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
                        backgroundColor: "#f0f0f0",
                      }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <h3 style={{ margin: "0.5rem 0", color: "#222" }}>
                      {item.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#555",
                        minHeight: "3em",
                      }}
                    >
                      {item.description}
                    </p>
                    <p
                      style={{
                        fontWeight: "bold",
                        marginTop: "0.5rem",
                        color: "#007acc",
                      }}
                    >
                      {item.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                    <button
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        border: "none",
                        backgroundColor: "#007acc",
                        color: "#fff",
                        cursor: "pointer",
                        width: "100%",
                        fontWeight: "bold",
                      }}
                      onClick={() => handleAddToList(item)}
                    >
                      Add to List
                    </button>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Menu;
