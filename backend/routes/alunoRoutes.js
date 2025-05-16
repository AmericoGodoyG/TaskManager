const express = require('express');
const router = express.Router();
const Aluno = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const alunos = await Aluno.find();
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

module.exports = router;
