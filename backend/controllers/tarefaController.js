const Tarefa = require('../models/Tarefa');
const User = require('../models/User');
const Equipe = require('../models/Equipe');

// ADMIN cria tarefa para aluno
exports.criarTarefa = async (req, res) => {
  try {
    const { descricao, dataEntrega, aluno, equipe } = req.body;

    const user = await User.findById(aluno);
    if (!user || user.tipo !== 'aluno') return res.status(400).json({ erro: 'Aluno inválido' });

    const tarefa = new Tarefa({ descricao, dataEntrega, aluno, equipe });
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
      .populate('equipe', 'nome');
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar tarefas' });
  }
};

// ADMIN: editar tarefa
exports.editarTarefa = async (req, res) => {
  try {
    const { descricao, dataEntrega, aluno, equipe } = req.body;
    const tarefaAtualizada = await Tarefa.findByIdAndUpdate(
      req.params.id,
      { descricao, dataEntrega, aluno, equipe },
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
