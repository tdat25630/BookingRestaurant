// import React from "react";
// import { useOrder } from "../context/OrderContext";

// function MenuItemCard({ item }) {
//   const { addToCart } = useOrder();

//   return (
//     <div className="menu-item-card">
//       <h4>{item.name}</h4>
//       <p>{item.description}</p>
//       <p>Giá: {item.price}₫</p>
//       <button
//         onClick={() =>
//           addToCart(
//             {
//               _id: item._id,
//               name: item.name,
//               price: item.price,
//             },
//             1
//           )
//         }
//       >
//         Gọi món
//       </button>
//     </div>
//   );
// }

// export default MenuItemCard;



// import React from "react";
// import { useOrder } from "../context/OrderContext";

// function MenuItemCard({ item }) {
//   const { addToCart } = useOrder();

//   const handleAdd = () => {
//     console.log("Gọi món:", item); // Kiểm tra có vào không
//     console.log("✅ addToCart:", addToCart);
//     addToCart(
//       {
//         _id: item._id,
//         name: item.name,
//         price: item.price,
//       },
//       1
//     );
//   };

//   return (
//     <div className="menu-item-card">
//       <h4>{item.name}</h4>
//       <p>{item.description}</p>
//       <p>Giá: {item.price}₫</p>
//       <button onClick={handleAdd}>Gọi món</button>
//     </div>
//   );
// }

// export default MenuItemCard;



import React from "react";
import { useOrder } from "../context/OrderContext";

function MenuItemCard({ item }) {
  const { addToCart } = useOrder();

  const handleAdd = () => {
    console.log("🛒 Item click:", item);
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.price,
    }, 1);
  };

  return (
    <div className="menu-item-card" style={{ position: "relative", zIndex: 1 }}>
      <h4>{item.name}</h4>
      <p>{item.description}</p>
      <p>Giá: {item.price}₫</p>
      <button 
        onClick={handleAdd}
        style={{ cursor: "pointer", zIndex: 2, position: "relative" }}
      >
        Gọi món
      </button>
    </div>
  );
}
export default MenuItemCard;