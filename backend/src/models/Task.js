const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'in_testing', 'done'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  date: { type: String, required: true },
  dueTime: { type: String },
  reminder2hSent: { type: Boolean, default: false },
  reminderEodSent: { type: Boolean, default: false },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  files: [{ url: String, public_id: String, name: String, resource_type: String, format: String, bytes: Number, original_filename: String }],
  comments: [{ text: String, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
