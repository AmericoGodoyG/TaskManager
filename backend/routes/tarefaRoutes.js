const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { isAdmin, isAluno } = require('../middlewares/roles');
const tarefaController = require('../controllers/tarefaController');

// Todas as rotas requerem autenticação
router.use(auth);

// ADMIN: criar tarefa
router.post('/', isAdmin, tarefaController.criarTarefa);

// ADMIN: listar todas as tarefas ou por aluno
router.get('/', isAdmin, tarefaController.listarTarefas);

// ADMIN: editar qualquer tarefa
router.put('/:id', isAdmin, tarefaController.editarTarefa);

// ADMIN: excluir tarefa
router.delete('/:id', isAdmin, tarefaController.excluirTarefa);

// ALUNO: visualizar suas tarefas
router.get('/minhas', isAluno, tarefaController.minhasTarefas);

// ALUNO: atualizar status da tarefa
router.put('/:id/status', isAluno, tarefaController.atualizarStatusAluno);

// ALUNO: controlar cronômetro
router.put('/:id/cronometro', isAluno, tarefaController.controlarCronometro);

module.exports = router;
