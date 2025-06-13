import { createContext, useContext, useState } from "react";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || null);

  const saveSession = (id) => {
    setSessionId(id);
    localStorage.setItem("sessionId", id); // lưu song song
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
