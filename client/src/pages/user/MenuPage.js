// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import CategoryList from '../../components/CategoryList';
// import MenuItemList from '../../components/MenuItemList';
// import Header from "../../components/Header";
// import Footer from "../../components/Footer";


// const MenuPage = () => {
//   const [categories, setCategories] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   useEffect(() => {
//     // Fetch danh mục
//     axios.get('http://localhost:8080/api/menu-categories')
//       .then(res => setCategories(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   useEffect(() => {
//     // Fetch món ăn (toàn bộ hoặc theo category)
//     const url = selectedCategory
//       ? `http://localhost:8080/api/menu-items?category=${selectedCategory}`
//       : `http://localhost:8080/api/menu-items`;

//     axios.get(url)
//       .then(res => setMenuItems(res.data))
//       .catch(err => console.error(err));
//   }, [selectedCategory]);

//   return (
//     <>
//       <Header />
   
      
//     <div>
//       <h1>Thực Đơn Nhà Hàng</h1>
//       <CategoryList categories={categories} onSelect={setSelectedCategory} />
//       <MenuItemList items={menuItems} />
//     </div>

//     <Footer />
   
//     </>
//   );
// };

// export default MenuPage;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import MenuItemCard from "../../components/MenuItemCard";

// function MenuPage() {
//   const [menuItems, setMenuItems] = useState([]);

//   useEffect(() => {
//     axios.get("http://localhost:8080/api/menu-items")

//     // axios.get("/api/menu-items")
//       .then(res => setMenuItems(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   return (
//     <div>
//       <h2>Menu</h2>
//       <div className="menu-grid">
//         {menuItems.map(item => (
//           <MenuItemCard key={item._id} item={item} />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default MenuPage;

import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";

import MenuItemCard from "../../components/MenuItemCard";
import { useOrder } from "../../context/OrderContext";

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const { cartItems } = useOrder(); // 👉 Truy cập giỏ hàng

  useEffect(() => {
    axios.get("http://localhost:8080/api/menu-items")
      .then(res => setMenuItems(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
     <>
          <Header />

    <div>
      <h2>Menu</h2>
      <p>🛒 Số món đã gọi: {cartItems.length}</p> {/* Xem giỏ hàng cập nhật chưa */}
      <div className="menu-grid">
        {menuItems.map(item => (
          <MenuItemCard key={item._id} item={item} />
        ))}
      </div>
    </div>
    </>
  );
}
export default MenuPage;