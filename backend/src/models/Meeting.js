const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  client: { type: String },
  datetime: { type: Date },
  attendees: { type: String },
  type: { type: String },
  company: { type: String, enum: ['EcomSkyline', 'ThinkAIWorks', 'Both'], default: 'EcomSkyline' },
  clientEmail: { type: String, default: '' },
  adminEmails: { type: [String], default: [] },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Meeting', MeetingSchema);
