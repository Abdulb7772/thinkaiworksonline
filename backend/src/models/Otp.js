const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  hashedOtp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 5,
  },
  resendCount: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  pendingData: {
    name: String,
    password: String,
    role: { type: String, default: 'customer' },
  },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ email: 1, verified: 1 });

module.exports = mongoose.model('Otp', OtpSchema);
