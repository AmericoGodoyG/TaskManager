const mongoose = require('mongoose');

const equipeSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  membros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Equipe', equipeSchema);