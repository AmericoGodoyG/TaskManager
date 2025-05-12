const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

router.post('/registrar', authController.registrar);
router.post('/login', authController.login);
router.get('/alunos', authController.listarAlunos);

module.exports = router;

