const mongoose = require('mongoose');

const UpdateEntrySchema = new mongoose.Schema({
  platform: { type: String, default: '' },
  profile: { type: String, default: '' },
  niche: { type: String, default: '' },
  clientName: { type: String, default: '' },
  description: { type: String, default: '' },
  pInvite: { type: String, default: '' },
  doi: { type: String, default: '' },
  status: { type: String, enum: ['V', 'I'], default: 'V' },
  fu1: { type: String, default: '' },
  fu2: { type: String, default: '' },
  response: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('UpdateEntry', UpdateEntrySchema);
