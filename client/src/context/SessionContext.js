import { createContext, useContext, useState } from "react";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || null);

  const saveSession = (id) => {
    setSessionId(id);
<<<<<<< HEAD
    localStorage.setItem("sessionId", id); // lưu song song
=======
    localStorage.setItem("sessionId", id); 
>>>>>>> origin/test
  };

  const clearSession = () => {
    setSessionId(null);
    localStorage.removeItem("sessionId");
  };

  return (
    <SessionContext.Provider value={{ sessionId, saveSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
