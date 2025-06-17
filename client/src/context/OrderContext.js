<<<<<<< HEAD
// import { createContext, useContext, useReducer } from "react";

// const OrderContext = createContext();

// const initialState = {
//   cartItems: [], // { menuItem, quantity, notes }
// };


// const reducer = (state, action) => {
//     switch (action.type) {
//       case "ADD_TO_CART":
//         const exists = state.cartItems.find(
//           item => item._id === action.payload._id
//         );
//         if (exists) {
//           return {
//             ...state,
//             cartItems: state.cartItems.map(item =>
//               item._id === action.payload._id
//                 ? { ...item, quantity: item.quantity + action.payload.quantity }
//                 : item
//             ),
//           };
//         } else {
//           return { ...state, cartItems: [...state.cartItems, action.payload] };
//         }
  
//       case "REMOVE_FROM_CART":
//         return {
//           ...state,
//           cartItems: state.cartItems.filter(item => item._id !== action.payload),
//         };
  
//       case "CLEAR_CART":
//         return { ...state, cartItems: [] };
  
//       default:
//         return state;
//     }
//   };
  
// // const reducer = (state, action) => {
// //   switch (action.type) {
// //     case "ADD_TO_CART":
// //       const exists = state.cartItems.find(item => item.menuItem._id === action.payload.menuItem._id);
// //       if (exists) {
// //         return {
// //           ...state,
// //           cartItems: state.cartItems.map(item =>
// //             item.menuItem._id === action.payload.menuItem._id
// //               ? { ...item, quantity: item.quantity + action.payload.quantity }
// //               : item
// //           )
// //         };
// //       } else {
// //         return { ...state, cartItems: [...state.cartItems, action.payload] };
// //       }
// //     case "REMOVE_FROM_CART":
// //       return {
// //         ...state,
// //         cartItems: state.cartItems.filter(item => item.menuItem._id !== action.payload)
// //       };
// //     case "CLEAR_CART":
// //       return { ...state, cartItems: [] };
// //     default:
// //       return state;
// //   }
// // };

// export const OrderProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(reducer, initialState);

// //   const addToCart = (menuItem, quantity = 1, notes = "") => {
// //     dispatch({ type: "ADD_TO_CART", payload: { menuItem, quantity, notes } });
// //   };

// const addToCart = (item, quantity = 1, notes = "") => {
//     dispatch({
//       type: "ADD_TO_CART",
//       payload: { ...item, quantity, notes },
//     });
//   };
  

//   const removeFromCart = (id) => {
//     dispatch({ type: "REMOVE_FROM_CART", payload: id });
//   };

//   const clearCart = () => {
//     dispatch({ type: "CLEAR_CART" });
//   };


//   const increaseQuantity = (id) => {
//     setCartItems(prev =>
//       prev.map(item =>
//         item._id === id ? { ...item, quantity: item.quantity + 1 } : item
//       )
//     );
//   };
  
//   const decreaseQuantity = (id) => {
//     setCartItems(prev =>
//       prev.map(item =>
//         item._id === id && item.quantity > 1
//           ? { ...item, quantity: item.quantity - 1 }
//           : item
//       )
//     );
//   };
  
//   const updateNote = (id, note) => {
//     setCartItems(prev =>
//       prev.map(item =>
//         item._id === id ? { ...item, note } : item
//       )
//     );
//   };
  

//   return (
//     <OrderContext.Provider value={{ cartItems: state.cartItems, addToCart, removeFromCart, clearCart, increaseQuantity,
//         decreaseQuantity,
//         updateNote }}>
//       {children}
//     </OrderContext.Provider>
//   );
// };


// // OrderContext.js
// // export const useOrder = () => useContext(OrderContext);


  

// export const useOrder = () => {
//   const context = useContext(OrderContext);
//   if (!context) {
//     throw new Error("useOrder must be used within an OrderProvider");
//   }
//   return context;
// };


import { createContext, useContext, useReducer } from "react";
=======
import { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";
>>>>>>> origin/test

const OrderContext = createContext();

const initialState = {
<<<<<<< HEAD
  cartItems: [], // { _id, name, price, quantity, note }
=======
  cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
  orderId: localStorage.getItem("orderId") || null,
>>>>>>> origin/test
};

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const exists = state.cartItems.find(item => item._id === action.payload._id);
      if (exists) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
        };
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item._id !== action.payload),
      };

    case "CLEAR_CART":
<<<<<<< HEAD
      return { ...state, cartItems: [] };
=======
      localStorage.removeItem("orderId");
      localStorage.removeItem("cartItems"); // 👈 xoá cả cart trong localStorage
      return {
        ...state,
        cartItems: [],
        orderId: null,
      };
>>>>>>> origin/test

    case "INCREASE_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item._id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };

    case "DECREASE_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item._id === action.payload && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      };

    case "UPDATE_NOTE":
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item._id === action.payload.id
            ? { ...item, notes: action.payload.note }
            : item
        ),
      };

<<<<<<< HEAD
=======
    case "LOAD_CART_FROM_SERVER":
      return {
        ...state,
        cartItems: action.payload,
      };

    case "SET_ORDER_ID":
      localStorage.setItem("orderId", action.payload);
      return {
        ...state,
        orderId: action.payload,
      };

>>>>>>> origin/test
    default:
      return state;
  }
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

<<<<<<< HEAD
=======
  // ✅ Tự động lưu cartItems vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  // ✅ Nếu có orderId → lấy từ server, nếu không → giữ từ localStorage
  useEffect(() => {
    const fetchCart = async () => {
      if (state.orderId) {
        try {
          const res = await axios.get(`http://localhost:8080/api/order-items/order/${state.orderId}`);
          const items = res.data.map(item => ({
            _id: item.menuItemId,
            name: item.menuItem?.name || "Không rõ",
            price: item.price,
            quantity: item.quantity,
            notes: item.notes || "",
          }));
          dispatch({ type: "LOAD_CART_FROM_SERVER", payload: items });
        } catch (err) {
          console.error("❌ Lỗi khi lấy lại giỏ hàng từ server:", err);
        }
      }
    };

    fetchCart();
  }, [state.orderId]);

>>>>>>> origin/test
  const addToCart = (item, quantity = 1, notes = "") => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { ...item, quantity, notes },
    });
  };

  const removeFromCart = (id) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const increaseQuantity = (id) => {
    dispatch({ type: "INCREASE_QUANTITY", payload: id });
  };

  const decreaseQuantity = (id) => {
    dispatch({ type: "DECREASE_QUANTITY", payload: id });
  };

  const updateNote = (id, note) => {
    dispatch({ type: "UPDATE_NOTE", payload: { id, note } });
  };

<<<<<<< HEAD
=======
  const loadCartFromServer = (items) => {
    dispatch({ type: "LOAD_CART_FROM_SERVER", payload: items });
  };

  const setOrderId = (id) => {
    dispatch({ type: "SET_ORDER_ID", payload: id });
  };

>>>>>>> origin/test
  return (
    <OrderContext.Provider
      value={{
        cartItems: state.cartItems,
<<<<<<< HEAD
=======
        orderId: state.orderId,
>>>>>>> origin/test
        addToCart,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        updateNote,
<<<<<<< HEAD
=======
        loadCartFromServer,
        setOrderId,
>>>>>>> origin/test
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};
<<<<<<< HEAD
=======


// import { createContext, useContext, useReducer } from "react";

// const OrderContext = createContext();

// const initialState = {
//   cartItems: [],
//   orderId: null, // ✅ Thêm orderId vào state ban đầu
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case "ADD_TO_CART":
//       const exists = state.cartItems.find(item => item._id === action.payload._id);
//       if (exists) {
//         return {
//           ...state,
//           cartItems: state.cartItems.map(item =>
//             item._id === action.payload._id
//               ? { ...item, quantity: item.quantity + action.payload.quantity }
//               : item
//           ),
//         };
//       } else {
//         return {
//           ...state,
//           cartItems: [...state.cartItems, action.payload],
//         };
//       }

//     case "REMOVE_FROM_CART":
//       return {
//         ...state,
//         cartItems: state.cartItems.filter(item => item._id !== action.payload),
//       };

//     case "CLEAR_CART":
//       return { ...state, cartItems: [] };

//     case "INCREASE_QUANTITY":
//       return {
//         ...state,
//         cartItems: state.cartItems.map(item =>
//           item._id === action.payload
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         ),
//       };

//     case "DECREASE_QUANTITY":
//       return {
//         ...state,
//         cartItems: state.cartItems.map(item =>
//           item._id === action.payload && item.quantity > 1
//             ? { ...item, quantity: item.quantity - 1 }
//             : item
//         ),
//       };

//     case "UPDATE_NOTE":
//       return {
//         ...state,
//         cartItems: state.cartItems.map(item =>
//           item._id === action.payload.id
//             ? { ...item, notes: action.payload.note }
//             : item
//         ),
//       };

//     case "LOAD_CART_FROM_SERVER":
//       return {
//         ...state,
//         cartItems: action.payload,
//       };

//     case "SET_ORDER_ID": // ✅ Cập nhật orderId
//       return {
//         ...state,
//         orderId: action.payload,
//       };

//     default:
//       return state;
//   }
// };

// export const OrderProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(reducer, initialState);

//   const addToCart = (item, quantity = 1, notes = "") => {
//     dispatch({
//       type: "ADD_TO_CART",
//       payload: { ...item, quantity, notes },
//     });
//   };

//   const removeFromCart = (id) => {
//     dispatch({ type: "REMOVE_FROM_CART", payload: id });
//   };

//   const clearCart = () => {
//     dispatch({ type: "CLEAR_CART" });
//   };

//   const increaseQuantity = (id) => {
//     dispatch({ type: "INCREASE_QUANTITY", payload: id });
//   };

//   const decreaseQuantity = (id) => {
//     dispatch({ type: "DECREASE_QUANTITY", payload: id });
//   };

//   const updateNote = (id, note) => {
//     dispatch({ type: "UPDATE_NOTE", payload: { id, note } });
//   };

//   const loadCartFromServer = (items) => {
//     dispatch({ type: "LOAD_CART_FROM_SERVER", payload: items });
//   };

//   const setOrderId = (id) => {
//     dispatch({ type: "SET_ORDER_ID", payload: id });
//   };

//   return (
//     <OrderContext.Provider
//       value={{
//         cartItems: state.cartItems,
//         orderId: state.orderId,         // ✅ expose orderId
//         addToCart,
//         removeFromCart,
//         clearCart,
//         increaseQuantity,
//         decreaseQuantity,
//         updateNote,
//         loadCartFromServer,
//         setOrderId,                     // ✅ expose setter
//       }}
//     >
//       {children}
//     </OrderContext.Provider>
//   );
// };

// import { createContext, useContext, useEffect, useReducer } from "react";
// import axios from "axios";

// const OrderContext = createContext();

// const initialState = {
//   cartItems: [],
//   orderId: localStorage.getItem("orderId") || null,
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case "ADD_TO_CART":
//       const exists = state.cartItems.find(item => item._id === action.payload._id);
//       if (exists) {
//         return {
//           ...state,
//           cartItems: state.cartItems.map(item =>
//             item._id === action.payload._id
//               ? { ...item, quantity: item.quantity + action.payload.quantity }
//               : item
//           ),
//         };
//       } else {
//         return {
//           ...state,
//           cartItems: [...state.cartItems, action.payload],
//         };
//       }

//     case "REMOVE_FROM_CART":
//       return {
//         ...state,
//         cartItems: state.cartItems.filter(item => item._id !== action.payload),
//       };

//     case "CLEAR_CART":
//       localStorage.removeItem("orderId");
//       return {
//         ...state,
//         cartItems: [],
//         orderId: null,
//       };

//     case "INCREASE_QUANTITY":
//       return {
//         ...state,
//         cartItems: state.cartItems.map(item =>
//           item._id === action.payload
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         ),
//       };

//     case "DECREASE_QUANTITY":
//       return {
//         ...state,
//         cartItems: state.cartItems.map(item =>
//           item._id === action.payload && item.quantity > 1
//             ? { ...item, quantity: item.quantity - 1 }
//             : item
//         ),
//       };

//     case "UPDATE_NOTE":
//       return {
//         ...state,
//         cartItems: state.cartItems.map(item =>
//           item._id === action.payload.id
//             ? { ...item, notes: action.payload.note }
//             : item
//         ),
//       };

//     case "LOAD_CART_FROM_SERVER":
//       return {
//         ...state,
//         cartItems: action.payload,
//       };

//     case "SET_ORDER_ID":
//       localStorage.setItem("orderId", action.payload);
//       return {
//         ...state,
//         orderId: action.payload,
//       };

//     default:
//       return state;
//   }
// };

// export const OrderProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(reducer, initialState);

//   const addToCart = (item, quantity = 1, notes = "") => {
//     dispatch({
//       type: "ADD_TO_CART",
//       payload: { ...item, quantity, notes },
//     });
//   };

//   const removeFromCart = (id) => {
//     dispatch({ type: "REMOVE_FROM_CART", payload: id });
//   };

//   const clearCart = () => {
//     dispatch({ type: "CLEAR_CART" });
//   };

//   const increaseQuantity = (id) => {
//     dispatch({ type: "INCREASE_QUANTITY", payload: id });
//   };

//   const decreaseQuantity = (id) => {
//     dispatch({ type: "DECREASE_QUANTITY", payload: id });
//   };

//   const updateNote = (id, note) => {
//     dispatch({ type: "UPDATE_NOTE", payload: { id, note } });
//   };

//   const loadCartFromServer = (items) => {
//     dispatch({ type: "LOAD_CART_FROM_SERVER", payload: items });
//   };

//   const setOrderId = (id) => {
//     dispatch({ type: "SET_ORDER_ID", payload: id });
//   };

//   // 🔄 Auto load cart khi có orderId sau khi refresh
//   useEffect(() => {
//     const fetchCart = async () => {
//       if (state.orderId) {
//         try {
//           const res = await axios.get(`http://localhost:8080/api/order-items/order/${state.orderId}`);
//           const items = res.data.map(item => ({
//             _id: item.menuItemId,
//             name: item.menuItem?.name || "Không rõ",
//             price: item.price,
//             quantity: item.quantity,
//             notes: item.notes || "",
//           }));
//           dispatch({ type: "LOAD_CART_FROM_SERVER", payload: items });
//         } catch (err) {
//           console.error("❌ Lỗi khi lấy lại giỏ hàng từ server:", err);
//         }
//       }
//     };

//     fetchCart();
//   }, [state.orderId]);

//   return (
//     <OrderContext.Provider
//       value={{
//         cartItems: state.cartItems,
//         orderId: state.orderId,
//         addToCart,
//         removeFromCart,
//         clearCart,
//         increaseQuantity,
//         decreaseQuantity,
//         updateNote,
//         loadCartFromServer,
//         setOrderId,
//       }}
//     >
//       {children}
//     </OrderContext.Provider>
//   );
// };

// export const useOrder = () => {
//   const context = useContext(OrderContext);
//   if (!context) {
//     throw new Error("useOrder must be used within an OrderProvider");
//   }
//   return context;
// };
>>>>>>> origin/test
