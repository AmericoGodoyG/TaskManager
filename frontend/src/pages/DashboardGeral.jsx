import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/DashboardGeral.css";
import "../styles/DashboardAdmin.css";

function DashboardGeral() {
  const [equipes, setEquipes] = useState([]);
  const [tarefas, setTarefas] = useState([]);

  useEffect(() => {
    buscarEquipes();
    buscarTarefas();
  }, []);

  const navigate = useNavigate();
  
      const logout = () => {
      localStorage.removeItem("token");
      navigate("/"); 
      };

  const buscarEquipes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/equipes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEquipes(res.data);
    } catch (err) {
      console.error("Erro ao buscar equipes:", err);
    }
  };

  const buscarTarefas = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tarefas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTarefas(res.data);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
    }
  };

  const renderStatusIndicator = (status) => {
  let bgColor = '#ccc';

  switch (status) {
    case 'pendente':
      bgColor = '#f44336';
      break;
    case 'em andamento':
      bgColor = '#ff9800';
      break;
    case 'concluído':
      bgColor = '#4caf50';
      break;
    default:
      break;
  }

  return (
    <div className="status-indicator-bar" style={{ backgroundColor: bgColor }} />
  );
};

  return (
  <div className="admin-page">

    <aside className="sidebar">
      <nav>
        <ul>
          <li className="menu-title">Dashboard</li>
          <li>
            <Link to="/admin/geral">Geral</Link>
          </li>
          <li>
            <Link to="/admin">Equipes</Link>
          </li>
          <li>
            <Link to="/admin/tarefas">Tarefas</Link>
          </li>
          <li>
            <button onClick={logout} className="logout-button">Sair</button>
          </li>
        </ul>
      </nav>
    </aside>

    <main className="dashboard-geral">
      <h2>Painel Geral</h2>

      <div className="cards-container">
        <div className="card cyan">
          <h3>Equipes Criadas</h3>
          <p>{equipes.length}</p>
        </div>
        <div className="card purple">
          <h3>Tarefas Criadas</h3>
          <p>{tarefas.length}</p>
        </div>
      </div>

      <div className="lista-tarefas">
        <h3>Todas as Tarefas</h3>
        {tarefas.map((tarefa) => (
          <div className="tarefa-item" key={tarefa._id}>
            <p><strong>Descrição:</strong> {tarefa.descricao}</p>
            <p><strong>Entrega:</strong> {new Date(tarefa.dataEntrega).toLocaleDateString()}</p>
            <p><strong>Equipe:</strong> {tarefa.equipe?.nome}</p>
            <p>
              <strong>Status:</strong> {tarefa.status.charAt(0).toUpperCase() + tarefa.status.slice(1)}
            </p>
            {renderStatusIndicator(tarefa.status)}
          </div>
        ))}
      </div>
    </main>
  </div>
);

}

export default DashboardGeral;
