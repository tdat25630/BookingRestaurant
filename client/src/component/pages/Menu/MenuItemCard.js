<<<<<<< HEAD:client/src/components/MenuItemCard.js
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
=======
import React from "react";
import { useOrder } from "../../../context/OrderContext";
import "./MenuItemCard.css";
>>>>>>> origin/test:client/src/component/pages/Menu/MenuItemCard.js

function MenuItemCard({ item }) {
  const { addToCart } = useOrder();

  const handleAdd = () => {
<<<<<<< HEAD:client/src/components/MenuItemCard.js
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
=======
    addToCart(
      {
        _id: item._id,
        name: item.name,
        price: item.price,
      },
      1
    );
  };

  const imageUrl = item.image?.startsWith("http")
    ? item.image
    : item.image
    ? `http://localhost:8080/uploads/${item.image}`
    : "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <div className="menu-card">
      <img src={imageUrl} alt={item.name} className="menu-card-img" />
      <div className="menu-card-body">
        <div className="menu-card-header">
          <h5 className="menu-card-title">{item.name}</h5>
          <p className="menu-card-desc">{item.description}</p>
        </div>
        <div className="menu-card-footer">
          <div className="menu-card-price">{item.price.toLocaleString()}₫</div>
          <button onClick={handleAdd}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default MenuItemCard;
>>>>>>> origin/test:client/src/component/pages/Menu/MenuItemCard.js
