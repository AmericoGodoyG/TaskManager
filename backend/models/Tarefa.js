const mongoose = require('mongoose');

const tarefaSchema = new mongoose.Schema({
  descricao: { type: String, required: true },
  dataEntrega: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pendente', 'em andamento', 'concluído'],
    default: 'pendente'
  },
  aluno: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipe', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Tarefa', tarefaSchema);
