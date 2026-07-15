const mongoose = require('mongoose');

const VerificationTokenSchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  token: { type: String, required: true },
  expires: { type: Date, required: true },
});

VerificationTokenSchema.index({ token: 1 });
VerificationTokenSchema.index({ identifier: 1 });

module.exports = mongoose.model('VerificationToken', VerificationTokenSchema);
