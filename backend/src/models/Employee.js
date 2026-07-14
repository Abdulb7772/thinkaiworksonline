const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String },
  company: { type: String, enum: ['EcomSkyline', 'ThinkAIWorks', 'Both'], default: 'EcomSkyline' },
  score: { type: Number },
  tasks: { type: Number },
  rating: { type: Number },
  attendance: { type: Number },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Employee', EmployeeSchema);
