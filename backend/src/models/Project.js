const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'project_started', 'employee_assigned', 'in_progress', 'working', 'testing', 'finishing_up', 'completed'], default: 'pending' },
  startDate: { type: String },
  completionDate: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
