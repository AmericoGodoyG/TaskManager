import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardAdmin from "./pages/DashboardAdmin.jsx";
import DashboardAluno from "./pages/DashboardAluno.jsx";
import "./styles/Login.css";
import Equipes from "./pages/Equipes.jsx";

function App() {
  const isAuthenticated = localStorage.getItem("token");
  const userType = localStorage.getItem("tipo");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Route for Admin */}
        <Route
          path="/admin"
          element={isAuthenticated && userType === "admin" ? <DashboardAdmin /> : <Navigate to="/" />}
        />
        
        {/* Protected Route for Student */}
        <Route
          path="/aluno"
          element={isAuthenticated && userType === "aluno" ? <DashboardAluno /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/criar-equipe"
          element={isAuthenticated && userType === "admin" ? <Equipes /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
