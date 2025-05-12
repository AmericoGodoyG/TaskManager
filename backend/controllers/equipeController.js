const Equipe = require('../models/Equipe');
const User = require('../models/User');

exports.criarEquipe = async (req, res) => {
  try {
    const { nome, membros } = req.body;

    // Validação do nome da equipe
    if (!nome || nome.trim() === "") {
      return res.status(400).json({ erro: "O nome da equipe é obrigatório" });
    }

    // Remover duplicados no array de membros
    const membrosUnicos = [...new Set(membros)];
    if (membrosUnicos.length !== membros.length) {
      return res.status(400).json({ erro: "Há membros duplicados na equipe" });
    }

    // Validar se todos os membros são alunos
    const usuarios = await User.find({ _id: { $in: membrosUnicos }, tipo: 'aluno' });
    if (usuarios.length !== membrosUnicos.length) {
      return res.status(400).json({ erro: "Alguns membros não são alunos válidos" });
    }

    // Criar a equipe
    const novaEquipe = new Equipe({ nome, membros: membrosUnicos });
    await novaEquipe.save();

    // Retornar a equipe criada com os dados populados
    const equipePopulada = await Equipe.findById(novaEquipe._id).populate('membros', 'nome email');
    res.status(201).json(equipePopulada);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar equipe", detalhe: err.message });
  }
};

exports.listarEquipes = async (req, res) => {
  try {
    const equipes = await Equipe.find().populate('membros', 'nome email');
    res.json(equipes);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar equipes' });
  }
};

exports.obterEquipe = async (req, res) => {
  try {
    const equipe = await Equipe.findById(req.params.id).populate('membros', 'nome email');
    if (!equipe) return res.status(404).json({ erro: 'Equipe não encontrada' });
    res.json(equipe);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar equipe' });
  }
};

exports.editarEquipe = async (req, res) => {
  try {
    const { nome, membros } = req.body;

    const equipeAtualizada = await Equipe.findByIdAndUpdate(
      req.params.id,
      { nome, membros },
      { new: true }
    ).populate('membros', 'nome email');

    if (!equipeAtualizada) {
      return res.status(404).json({ erro: 'Equipe não encontrada' });
    }

    res.json(equipeAtualizada);
  } catch (err) {
    console.error('Erro ao editar equipe:', err.message);
    res.status(500).json({ erro: 'Erro ao editar equipe', detalhe: err.message });
  }
};


exports.excluirEquipe = async (req, res) => {
  try {
    await Equipe.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Equipe excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir equipe' });
  }
};
