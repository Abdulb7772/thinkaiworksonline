const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
