const express = require("express");
const router = express.Router();
const Usuario = require("../models/User.js");
const Equipe = require("../models/Equipe");
const Tarefa = require("../models/Tarefa");
const verificarToken = require('../middlewares/auth.js');

// [GET] /api/admin/metricas
router.get("/metricas", verificarToken, async (req, res) => {
  try {
    const totalEquipes = await Equipe.countDocuments();
    const totalAlunos = await Usuario.countDocuments({ tipo: "aluno" });
    const totalTarefas = await Tarefa.countDocuments();

    const statusCounts = await Tarefa.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const porStatus = {
      pendente: 0,
      "em andamento": 0,
      concluído: 0,
    };

    statusCounts.forEach((s) => {
      porStatus[s._id] = s.count;
    });

    res.json({ totalEquipes, totalAlunos, totalTarefas, porStatus });
  } catch (err) {
    res.status(500).json({ mensagem: "Erro ao carregar métricas" });
  }
});

module.exports = router;
