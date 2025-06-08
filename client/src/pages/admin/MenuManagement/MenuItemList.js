import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MenuItemList = () => {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
    //   const res = await axios.get("http://localhost:8080/api/admin/menu", {

        const res = await axios.get("http://localhost:8080/api/menu", {

        withCredentials: true,
      });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch menu items", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      <h3 className="font-semibold mb-2">Món ăn</h3>
      <ul className="divide-y">
        {items.map(item => (
          <li key={item._id} className="py-2">
            {item.name} - {item.price}₫
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuItemList;
