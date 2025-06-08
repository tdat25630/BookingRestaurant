import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/user/Home";
import Menu from "./pages/user/Menu";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} /> {/* ← Thêm route này */}
      </Routes>
    </Router>
  );
}

export default App;
