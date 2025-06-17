import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/TarefasAdmin.css";

function TarefasAdmin() {
  const [descricao, setDescricao] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [equipes, setEquipes] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [equipeSelecionada, setEquipeSelecionada] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [tarefas, setTarefas] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");
  const [modoEdicao, setModoEdicao] = useState(false);
  const [idTarefaEditando, setIdTarefaEditando] = useState(null);
  const [tempoEstimado, setTempoEstimado] = useState("");
  const [urgencia, setUrgencia] = useState("baixa");

  useEffect(() => {
    buscarEquipes();
    listarTarefas();
  }, []);

  const iniciarEdicao = (tarefa) => {
    setModoEdicao(true);
    setIdTarefaEditando(tarefa._id);
    setDescricao(tarefa.descricao);
    setDataEntrega(tarefa.dataEntrega.split("T")[0]);
    setEquipeSelecionada(tarefa.equipe?._id);
    setTempoEstimado(tarefa.tempoEstimado || "");
    setUrgencia(tarefa.urgencia || "baixa");
    buscarAlunosDaEquipe(tarefa.equipe?._id);
    setAlunoSelecionado(tarefa.aluno?._id);
  };

  const atualizarTarefa = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/tarefas/${idTarefaEditando}`,
        {
          descricao,
          dataEntrega,
          equipe: equipeSelecionada,
          aluno: alunoSelecionado,
          tempoEstimado: parseInt(tempoEstimado) || null,
          urgencia
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTipoMensagem("sucesso");
      setMensagem("Tarefa atualizada com sucesso!");
      setTimeout(() => setMensagem(""), 3000);
      cancelarEdicao();
      listarTarefas();
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
    }
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    setIdTarefaEditando(null);
    setDescricao("");
    setDataEntrega("");
    setEquipeSelecionada("");
    setAlunoSelecionado("");
    setTempoEstimado("");
    setUrgencia("baixa");
    setAlunos([]);
  };

  const deletarTarefa = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tarefas/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTipoMensagem("sucesso");
      setMensagem("Tarefa deletada com sucesso!");
      setTimeout(() => setMensagem(""), 3000);
      listarTarefas();
    } catch (err) {
      console.error("Erro ao deletar tarefa:", err);
    }
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

  const buscarAlunosDaEquipe = async (equipeId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/equipes/${equipeId}/alunos`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAlunos(res.data);
    } catch (err) {
      console.error("Erro ao buscar alunos da equipe:", err);
    }
  };

  const listarTarefas = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tarefas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTarefas(res.data);
    } catch (err) {
      console.error("Erro ao listar tarefas:", err);
    }
  };

  const handleEquipeChange = (e) => {
    const id = e.target.value;
    setEquipeSelecionada(id);
    setAlunoSelecionado(""); // Resetar aluno selecionado
    buscarAlunosDaEquipe(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hoje = new Date();
    const dataSelecionada = new Date(dataEntrega);

    hoje.setHours(0, 0, 0, 0);
    dataSelecionada.setHours(0, 0, 0, 0);

    if (dataSelecionada < hoje) {
      setTipoMensagem("erro");
      setMensagem("A data de entrega não pode ser anterior à data de hoje.");
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    if(modoEdicao){
      await atualizarTarefa();
    }else{
      try {
        await axios.post(
          "http://localhost:5000/api/tarefas",
          {
            descricao,
            dataEntrega,
            equipe: equipeSelecionada,
            aluno: alunoSelecionado,
            tempoEstimado: parseInt(tempoEstimado) || null,
            urgencia
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDescricao("");
        setDataEntrega("");
        setEquipeSelecionada("");
        setAlunoSelecionado("");
        setTempoEstimado("");
        setUrgencia("baixa");
        setAlunos([]);
        listarTarefas();

        setTipoMensagem("sucesso");
        setMensagem("Tarefa criada com sucesso!");
        setTimeout(() => {
          setMensagem("");
        }, 3000);
      } catch (err) {
        console.error("Erro ao criar tarefa:", err);
      }
    }
  };

  return (
    <div className="tarefas-admin">
      <h2>Gerenciar Tarefas</h2>

      <form className="form-tarefa" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />

        <input
          type="date"
          value={dataEntrega}
          onChange={(e) => setDataEntrega(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Tempo estimado (em minutos)"
          value={tempoEstimado}
          onChange={(e) => setTempoEstimado(e.target.value)}
          min="0"
        />

        <select 
          value={urgencia} 
          onChange={(e) => setUrgencia(e.target.value)}
          required
        >
          <option value="baixa">Urgência Baixa</option>
          <option value="media">Urgência Média</option>
          <option value="alta">Urgência Alta</option>
        </select>

        <select value={equipeSelecionada} onChange={handleEquipeChange} required>
          <option value="">Selecione uma equipe</option>
          {equipes.map((e) => (
            <option key={e._id} value={e._id}>
              {e.nome}
            </option>
          ))}
        </select>

        <select
          value={alunoSelecionado}
          onChange={(e) => setAlunoSelecionado(e.target.value)}
          required
          disabled={!equipeSelecionada}
        >
          <option value="">Selecione um aluno</option>
          {alunos.map((a) => (
            <option key={a._id} value={a._id}>
              {a.nome}
            </option>
          ))}
        </select>

        <button type="submit">
          {modoEdicao ? "Salvar" : "Criar Tarefa"}
        </button>

        {mensagem && <div className={`mensagem ${tipoMensagem}`}>{mensagem}</div>}
      </form>

      <div className="lista-tarefas">
        <h3>Tarefas Criadas</h3>
        {tarefas.length === 0 ? (
          <p>Nenhuma tarefa cadastrada.</p>
        ) : (
          tarefas.map((t) => (
            <div key={t._id} className={`tarefa-item urgencia-${t.urgencia}`}>
              <p><strong>Descrição:</strong> {t.descricao}</p>
              <p><strong>Entrega:</strong> {new Date(t.dataEntrega).toLocaleDateString()}</p>
              <p><strong>Aluno:</strong> {t.aluno?.nome}</p>
              <p><strong>Equipe:</strong> {t.equipe?.nome}</p>
              <p><strong>Status:</strong> {t.status}</p>
              <p><strong>Urgência:</strong> {t.urgencia.charAt(0).toUpperCase() + t.urgencia.slice(1)}</p>
              {t.tempoEstimado && (
                <p><strong>Tempo Estimado:</strong> {t.tempoEstimado} minutos</p>
              )}
              {t.tempoGasto > 0 && (
                <p><strong>Tempo Gasto:</strong> {t.tempoGasto} minutos</p>
              )}
              <div className="buttons">
                <button className="edit-btn" onClick={() => iniciarEdicao(t)}>Editar</button>
                <button className="delete-btn" onClick={() => deletarTarefa(t._id)}>Excluir</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TarefasAdmin;
