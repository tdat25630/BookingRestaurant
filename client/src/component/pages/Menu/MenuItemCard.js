import React from "react";
import { useOrder } from "../../../context/OrderContext";
import "./MenuItemCard.css"; 

function MenuItemCard({ item }) {
  const { addToCart } = useOrder();

  const handleAdd = () => {
    console.log("🛒 Gọi món:", item);
    addToCart(
      {
        _id: item._id,
        name: item.name,
        price: item.price,
      },
      1
    );
  };

  return (
    <div className="menu-card">
      <img
        src={item.image || "https://via.placeholder.com/300x200?text=No+Image"}
        alt={item.name}
        className="menu-card-img"
      />
      <div className="menu-card-body">
        <div className="menu-card-header">
          <h5 className="menu-card-title">{item.name}</h5>
          <p className="menu-card-desc">{item.description}</p>
        </div>
        <div className="menu-card-footer">
          <div className="menu-card-price">{item.price.toLocaleString()}₫</div>
          <button onClick={handleAdd}>Gọi món</button>
        </div>
      </div>
    </div>
  );
}

export default MenuItemCard;
