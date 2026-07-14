const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  company: { type: String, enum: ['EcomSkyline', 'ThinkAIWorks', 'Both'], default: 'Both' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Budget', BudgetSchema);
