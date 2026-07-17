const mongoose = require('mongoose');

const SUB_ROLES = ['intern', 'developer', 'team lead', 'member', 'manager', 'hr', 'accountant'];

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  loginEmail: { type: String },
  email: { type: String },
  role: { type: String },
  subRole: { type: String },
  company: { type: String, enum: ['EcomSkyline', 'ThinkAIWorks', 'Both'], default: 'ThinkAIWorks' },
  score: { type: Number },
  tasks: { type: Number },
  rating: { type: Number },
  attendance: { type: Number },
  attendanceLog: { type: Map, of: String },
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Employee', EmployeeSchema);
module.exports.SUB_ROLES = SUB_ROLES;
