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

const OrderContext = createContext();

const initialState = {
  cartItems: [], // { _id, name, price, quantity, note }
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
      return { ...state, cartItems: [] };

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

    default:
      return state;
  }
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  return (
    <OrderContext.Provider
      value={{
        cartItems: state.cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        updateNote,
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
