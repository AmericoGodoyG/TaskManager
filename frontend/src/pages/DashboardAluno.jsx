import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaSignOutAlt } from 'react-icons/fa';
import "../styles/DashboardAluno.css";
import "../styles/DashboardAdmin.css";

function DashboardAluno() {
  const [tarefas, setTarefas] = useState([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [statusAtualizado, setStatusAtualizado] = useState("");
  const [alunoNome, setAlunoNome] = useState("");

    useEffect(() => {
        const nomeSalvo = localStorage.getItem("nome");
        if (nomeSalvo) setAlunoNome(nomeSalvo);
        buscarMinhasTarefas();
    }, []);

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("nome");
        navigate("/");
    };

  const buscarMinhasTarefas = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tarefas/aluno/minhas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTarefas(res.data);
      setAlunoNome(localStorage.getItem("nome"));
    } catch (err) {
      console.error("Erro ao buscar tarefas do aluno:", err);
    }
  };

  const abrirTarefa = (tarefa) => {
    setTarefaSelecionada(tarefa);
    setStatusAtualizado(tarefa.status);
  };

  const atualizarStatus = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/tarefas/${tarefaSelecionada._id}/status`,
        { status: statusAtualizado },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      buscarMinhasTarefas();
      setTarefaSelecionada(null);
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  return (
    <div className="admin-page">
      <aside className="sidebar">
        <nav>
          <ul>
            <li className="menu-title">Painel do Aluno</li>
            <li>
              <Link to="/aluno" className="active">
                <span><FaTasks /> Minhas Tarefas</span>
              </Link>
            </li>
          </ul>
          <ul className="sidebar-bottom">
            <li>
              <button onClick={logout} className="logout-button">
                <span><FaSignOutAlt /> Sair</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="dashboard-aluno">
        {alunoNome && <h3 className="boas-vindas">Bem-vindo(a), {alunoNome}!</h3>}
        <h2>Minhas Tarefas</h2>

        {tarefas.length === 0 ? (
          <p>Nenhuma tarefa atribuída.</p>
        ) : (
          tarefas.map((tarefa) => (
            <div key={tarefa._id} className="tarefa-card">
              <p><strong>Descrição:</strong> {tarefa.descricao}</p>
              <p><strong>Data de Entrega:</strong> {new Date(tarefa.dataEntrega).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {tarefa.status}</p>
              <button onClick={() => abrirTarefa(tarefa)}>Ver Tarefa</button>
            </div>
          ))
        )}

        {tarefaSelecionada && (
          <div className="modal-tarefa">
            <h3>Detalhes da Tarefa</h3>
            <p><strong>Descrição:</strong> {tarefaSelecionada.descricao}</p>
            <p><strong>Entrega:</strong> {new Date(tarefaSelecionada.dataEntrega).toLocaleDateString()}</p>
            <p><strong>Equipe:</strong> {tarefaSelecionada.equipe?.nome}</p>
            <p><strong>Status Atual:</strong> {tarefaSelecionada.status}</p>

            <label htmlFor="status">Alterar Status:</label>
            <select
              id="status"
              value={statusAtualizado}
              onChange={(e) => setStatusAtualizado(e.target.value)}
            >
              <option value="pendente">Pendente</option>
              <option value="em andamento">Em andamento</option>
              <option value="concluído">concluído</option>
            </select>

            <div className="botoes-modal">
              <button onClick={atualizarStatus}>Salvar</button>
              <button onClick={() => setTarefaSelecionada(null)}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardAluno;
