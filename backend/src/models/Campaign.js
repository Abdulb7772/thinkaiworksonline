const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, enum: ['EcomSkyline', 'ThinkAIWorks'], default: 'EcomSkyline' },
  sent: { type: Number, default: 0 },
  opens: { type: String },
  replies: { type: String },
  status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Campaign', CampaignSchema);
