const Tarefa = require('../models/Tarefa');
const User = require('../models/User');
const Equipe = require('../models/Equipe');

// ADMIN cria tarefa para aluno
exports.criarTarefa = async (req, res) => {
  try {
    const { descricao, detalhes, dataEntrega, aluno, equipe, tempoEstimado, urgencia } = req.body;

    const user = await User.findById(aluno);
    if (!user || user.tipo !== 'aluno') return res.status(400).json({ erro: 'Aluno inválido' });

    const tarefa = new Tarefa({ 
      descricao, 
      detalhes,
      dataEntrega, 
      aluno, 
      equipe,
      tempoEstimado,
      urgencia
    });
    await tarefa.save();

    res.status(201).json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar tarefa', detalhe: err.message });
  }
};

// ADMIN: listar tarefas (ou filtrar por aluno/equipe)
exports.listarTarefas = async (req, res) => {
  try {
    const { aluno, equipe } = req.query;
    const filtro = {};
    if (aluno) filtro.aluno = aluno;
    if (equipe) filtro.equipe = equipe;

    const tarefas = await Tarefa.find(filtro)
      .populate('aluno', 'nome')
      .populate('equipe', 'nome')
      .sort({ urgencia: -1, dataEntrega: 1 }); // Ordena por urgência (alta > média > baixa) e depois por data
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar tarefas' });
  }
};

// ADMIN: editar tarefa
exports.editarTarefa = async (req, res) => {
  try {
    const { descricao, detalhes, dataEntrega, aluno, equipe, tempoEstimado, urgencia } = req.body;
    const tarefaAtualizada = await Tarefa.findByIdAndUpdate(
      req.params.id,
      { descricao, detalhes, dataEntrega, aluno, equipe, tempoEstimado, urgencia },
      { new: true }
    );
    res.json(tarefaAtualizada);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao editar tarefa' });
  }
};

// ADMIN: excluir
exports.excluirTarefa = async (req, res) => {
  try {
    await Tarefa.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Tarefa excluída' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir tarefa' });
  }
};

// ALUNO: visualizar suas tarefas
exports.minhasTarefas = async (req, res) => {
  try {
    const tarefas = await Tarefa.find({ aluno: req.user.id })
      .populate('equipe', 'nome');
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar suas tarefas' });
  }
};

// ALUNO: atualizar status
exports.atualizarStatusAluno = async (req, res) => {
  try {
    const { status } = req.body;
    const tarefa = await Tarefa.findOne({ _id: req.params.id, aluno: req.user.id });

    if (!tarefa) return res.status(403).json({ erro: 'Você não pode editar essa tarefa' });

    tarefa.status = status;
    await tarefa.save();

    res.json({ msg: 'Status atualizado com sucesso', tarefa });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
};

// ALUNO: controlar cronômetro
exports.controlarCronometro = async (req, res) => {
  try {
    const { acao } = req.body; // 'iniciar' ou 'pausar'
    const tarefa = await Tarefa.findOne({ _id: req.params.id, aluno: req.user.id });

    if (!tarefa) return res.status(403).json({ erro: 'Você não pode editar essa tarefa' });

    if (acao === 'iniciar') {
      if (tarefa.cronometroAtivo) {
        return res.status(400).json({ erro: 'Cronômetro já está ativo' });
      }
      tarefa.cronometroAtivo = true;
      tarefa.ultimaAtualizacaoCronometro = new Date();
    } else if (acao === 'pausar') {
      if (!tarefa.cronometroAtivo) {
        return res.status(400).json({ erro: 'Cronômetro já está pausado' });
      }
      const tempoDecorrido = Math.floor((new Date() - tarefa.ultimaAtualizacaoCronometro) / 60000); // converte para minutos
      tarefa.tempoGasto += tempoDecorrido;
      tarefa.cronometroAtivo = false;

      // Verifica se o tempo estimado foi excedido
      if (tarefa.tempoEstimado && tarefa.tempoGasto > tarefa.tempoEstimado) {
        tarefa.tempoExcedido = true;
      }
    }

    await tarefa.save();
    res.json({ 
      msg: `Cronômetro ${acao}do com sucesso`, 
      tarefa,
      tempoExcedido: tarefa.tempoExcedido
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao controlar cronômetro' });
  }
};
