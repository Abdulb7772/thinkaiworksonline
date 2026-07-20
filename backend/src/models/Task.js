const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'in_testing', 'done'], default: 'pending' },
  date: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
