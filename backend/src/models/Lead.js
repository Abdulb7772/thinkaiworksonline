const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  profileUrl: { type: String },
  service: { type: String },
  company: { type: String, enum: ['EcomSkyline', 'ThinkAIWorks'], default: 'EcomSkyline' },
  budgetRange: { type: String },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  brief: { type: String },
  assignedTo: { type: String },
  score: { type: Number },
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Lost'], default: 'New' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lead', LeadSchema);
