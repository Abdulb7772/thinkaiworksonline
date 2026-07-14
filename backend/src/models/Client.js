const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, enum: ['EcomSkyline', 'ThinkAIWorks'], default: 'EcomSkyline' },
  service: { type: String },
  value: { type: String },
  stage: { type: String, default: 'Discovery' },
  assignedTo: { type: String },
  lastContact: { type: String },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Client', ClientSchema);
