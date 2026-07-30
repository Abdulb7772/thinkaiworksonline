const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  files: [{ url: String, public_id: String, name: String, resource_type: String, format: String, bytes: Number, original_filename: String }],
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
