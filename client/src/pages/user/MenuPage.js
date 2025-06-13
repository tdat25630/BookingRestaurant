import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
import MenuItemCard from "../../components/MenuItemCard";
import { useOrder } from "../../context/OrderContext";
import { useSession } from "../../context/SessionContext";
import { useSearchParams } from "react-router-dom";

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [sessionValid, setSessionValid] = useState(null); // null: chưa kiểm tra, true: hợp lệ, false: không hợp lệ
  const { cartItems } = useOrder();
  const { sessionId, saveSession } = useSession();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const idFromUrl = searchParams.get("sessionId");
    if (idFromUrl) {
      saveSession(idFromUrl);
      localStorage.setItem("sessionId", idFromUrl);
      console.log("✅ Đã lưu sessionId:", idFromUrl);
    } else {
      const stored = localStorage.getItem("sessionId");
      if (stored) {
        saveSession(stored);
        console.log("♻️ Khôi phục từ localStorage:", stored);
      } else {
        alert("⚠️ Không tìm thấy sessionId! Vui lòng quét mã QR hoặc chọn bàn.");
        setSessionValid(false);
      }
    }
  }, []);

  // Kiểm tra session hợp lệ
  useEffect(() => {
    const validateSession = async () => {
      if (!sessionId) return;

      try {
        const res = await axios.get(`http://localhost:8080/api/dining-sessions/${sessionId}`);
        if (res.data.status !== "active") {
          throw new Error("Session không còn active");
        }
        setSessionValid(true);
      } catch (err) {
        console.error("❌ Session ID không hợp lệ hoặc không còn active:", err);
        setSessionValid(false);
      }
    };

    validateSession();
  }, [sessionId]);

  // Lấy menu sau khi xác nhận session hợp lệ
  useEffect(() => {
    if (sessionValid) {
      axios
        .get("http://localhost:8080/api/menu-items")
        .then((res) => setMenuItems(res.data))
        .catch((err) => console.error(err));
    }
  }, [sessionValid]);

  if (sessionValid === null) {
    return <p>🔍 Đang kiểm tra phiên ăn uống...</p>;
  }

  if (sessionValid === false) {
    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ color: "red" }}>❌ Phiên không hợp lệ hoặc đã kết thúc</h2>
        <p>Vui lòng quét lại mã QR hoặc chọn lại bàn để bắt đầu phiên mới.</p>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div>
        <h2>Menu</h2>
        <p>🛒 Số món đã gọi: {cartItems.length}</p>
        <div className="menu-grid">
          {menuItems.map((item) => (
            <MenuItemCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}

export default MenuPage;
