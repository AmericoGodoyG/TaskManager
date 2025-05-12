exports.isAdmin = (req, res, next) => {
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ erro: 'Acesso restrito a administradores' });
    }
    next();
  };
  
  exports.isAluno = (req, res, next) => {
    if (req.user.tipo !== 'aluno') {
      return res.status(403).json({ erro: 'Acesso restrito a alunos' });
    }
    next();
  };
  