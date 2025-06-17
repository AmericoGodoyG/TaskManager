import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaSignOutAlt, FaFileDownload } from 'react-icons/fa';
import "../styles/DashboardAluno.css";
import "../styles/DashboardAdmin.css";
import jsPDF from 'jspdf';

function DashboardAluno() {
  const [tarefas, setTarefas] = useState([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [statusAtualizado, setStatusAtualizado] = useState("");
  const [alunoNome, setAlunoNome] = useState("");
  const [cronometrosAtivos, setCronometrosAtivos] = useState({});

  useEffect(() => {
    buscarTarefas();
    buscarNomeAluno();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const agora = new Date();
      const novosCronometros = { ...cronometrosAtivos };
      let atualizou = false;

      tarefas.forEach(tarefa => {
        if (tarefa.cronometroAtivo) {
          const tempoDecorrido = Math.floor((agora - new Date(tarefa.ultimaAtualizacaoCronometro)) / 60000);
          novosCronometros[tarefa._id] = (tarefa.tempoGasto || 0) + tempoDecorrido;
          atualizou = true;
        }
      });

      if (atualizou) {
        setCronometrosAtivos(novosCronometros);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [tarefas, cronometrosAtivos]);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    navigate("/");
  };

  const buscarTarefas = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tarefas/minhas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTarefas(res.data);
      
      const cronometros = {};
      res.data.forEach(tarefa => {
        if (tarefa.cronometroAtivo) {
          const tempoDecorrido = Math.floor((new Date() - new Date(tarefa.ultimaAtualizacaoCronometro)) / 60000);
          cronometros[tarefa._id] = (tarefa.tempoGasto || 0) + tempoDecorrido;
        }
      });
      setCronometrosAtivos(cronometros);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
    }
  };

  const buscarNomeAluno = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/alunos/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAlunoNome(res.data.nome);
    } catch (err) {
      console.error("Erro ao buscar nome do aluno:", err);
    }
  };

  const controlarCronometro = async (tarefaId, acao) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/tarefas/${tarefaId}/cronometro`,
        { acao },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const tarefasAtualizadas = tarefas.map(t => {
        if (t._id === tarefaId) {
          return res.data.tarefa;
        }
        return t;
      });
      setTarefas(tarefasAtualizadas);

      if (acao === 'iniciar') {
        setCronometrosAtivos(prev => ({
          ...prev,
          [tarefaId]: res.data.tarefa.tempoGasto
        }));
      } else {
        setCronometrosAtivos(prev => {
          const novos = { ...prev };
          delete novos[tarefaId];
          return novos;
        });
      }
    } catch (err) {
      console.error("Erro ao controlar cronômetro:", err);
    }
  };

  const formatarTempo = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
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
      buscarTarefas();
      setTarefaSelecionada(null);
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const fecharTarefa = () => {
    setTarefaSelecionada(null);
  };

  const gerarPDF = (tarefa) => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Detalhes da Tarefa", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    const yInicial = 40;
    const espacoEntreLinhas = 10;
    
    doc.text(`Descrição: ${tarefa.descricao}`, 20, yInicial);
    doc.text(`Data de Entrega: ${new Date(tarefa.dataEntrega).toLocaleDateString()}`, 20, yInicial + espacoEntreLinhas);
    doc.text(`Equipe: ${tarefa.equipe?.nome}`, 20, yInicial + (espacoEntreLinhas * 2));
    doc.text(`Status: ${tarefa.status}`, 20, yInicial + (espacoEntreLinhas * 3));
    
    if (tarefa.tempoEstimado) {
      doc.text(`Tempo Estimado: ${formatarTempo(tarefa.tempoEstimado)}`, 20, yInicial + (espacoEntreLinhas * 4));
    }
    
    if (tarefa.tempoGasto > 0) {
      doc.text(`Tempo Gasto: ${formatarTempo(tarefa.tempoGasto)}`, 20, yInicial + (espacoEntreLinhas * 5));
    }
    
    const dataAtual = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`PDF gerado em: ${dataAtual}`, 20, 280);
    
    doc.save(`tarefa_${tarefa._id}.pdf`);
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
              {tarefa.tempoEstimado && (
                <p><strong>Tempo Estimado:</strong> {formatarTempo(tarefa.tempoEstimado)}</p>
              )}
              {tarefa.cronometroAtivo ? (
                <p><strong>Tempo Gasto:</strong> {formatarTempo(cronometrosAtivos[tarefa._id] || tarefa.tempoGasto)}</p>
              ) : tarefa.tempoGasto > 0 && (
                <p><strong>Tempo Gasto:</strong> {formatarTempo(tarefa.tempoGasto)}</p>
              )}
              <div className="tarefa-actions">
                <button onClick={() => abrirTarefa(tarefa)}>Ver Detalhes</button>
                {tarefa.tempoEstimado && (
                  <button 
                    onClick={() => controlarCronometro(tarefa._id, tarefa.cronometroAtivo ? 'pausar' : 'iniciar')}
                    className={tarefa.cronometroAtivo ? 'pause-btn' : 'start-btn'}
                  >
                    {tarefa.cronometroAtivo ? 'Pausar' : 'Iniciar'} Cronômetro
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {tarefaSelecionada && (
          <div className="modal-tarefa">
            <div className="modal-content">
              <h3>Detalhes da Tarefa</h3>
              <p><strong>Descrição:</strong> {tarefaSelecionada.descricao}</p>
              <p><strong>Entrega:</strong> {new Date(tarefaSelecionada.dataEntrega).toLocaleDateString()}</p>
              <p><strong>Equipe:</strong> {tarefaSelecionada.equipe?.nome}</p>
              <p><strong>Status Atual:</strong> {tarefaSelecionada.status}</p>
              {tarefaSelecionada.tempoEstimado && (
                <p><strong>Tempo Estimado:</strong> {formatarTempo(tarefaSelecionada.tempoEstimado)}</p>
              )}
              {tarefaSelecionada.cronometroAtivo ? (
                <p><strong>Tempo Gasto:</strong> {formatarTempo(cronometrosAtivos[tarefaSelecionada._id] || tarefaSelecionada.tempoGasto)}</p>
              ) : tarefaSelecionada.tempoGasto > 0 && (
                <p><strong>Tempo Gasto:</strong> {formatarTempo(tarefaSelecionada.tempoGasto)}</p>
              )}
              <div className="modal-buttons">
                <button onClick={() => gerarPDF(tarefaSelecionada)} className="download-btn">
                  <FaFileDownload /> Baixar PDF
                </button>
                <button onClick={fecharTarefa}>Fechar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardAluno;
