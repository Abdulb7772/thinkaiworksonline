const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  client: { type: String },
  datetime: { type: Date },
  attendees: { type: String },
  type: { type: String },
  company: { type: String, enum: ['EcomSkyline', 'ThinkAIWorks', 'Both'], default: 'EcomSkyline' },
  clientEmails: { type: [String], default: [] },
  creatorEmail: { type: String, default: '' },
  attendeeEmails: { type: [String], default: [] },
  adminEmails: { type: [String], default: [] },
  meetingLink: { type: String, default: '' },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  followUpSent2h: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Meeting', MeetingSchema);
