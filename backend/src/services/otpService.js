const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');

const OTP_EXPIRY_SECONDS = parseInt(process.env.OTP_EXPIRY_SECONDS, 10) || 60;
const OTP_RESEND_COOLDOWN = 30;
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5;
const OTP_MAX_RESENDS = parseInt(process.env.OTP_MAX_RESENDS, 10) || 3;

const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(otp, salt);
};

const createOtpSession = async ({ email, name, password, role, ip, userAgent }) => {
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);

  await Otp.deleteMany({ email, verified: false });

  await Otp.create({
    email,
    hashedOtp,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000),
    maxAttempts: OTP_MAX_ATTEMPTS,
    pendingData: { name, password, role: role || 'customer' },
    ip,
    userAgent,
  });

  return otp;
};

const verifyOtp = async (email, otp) => {
  const record = await Otp.findOne({ email, verified: false }).sort({ createdAt: -1 });
  if (!record) return { valid: false, reason: 'No OTP found. Request a new one.' };
  if (record.verified) return { valid: false, reason: 'OTP already used.' };
  if (Date.now() > record.expiresAt.getTime()) {
    return { valid: false, reason: 'OTP expired. Request a new one.' };
  }
  if (record.attempts >= record.maxAttempts) {
    return { valid: false, reason: 'Too many failed attempts. Request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(otp, record.hashedOtp);
  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    const remaining = record.maxAttempts - record.attempts;
    if (remaining <= 0) {
      return { valid: false, reason: 'Too many failed attempts. Request a new OTP.' };
    }
    return { valid: false, reason: `Invalid OTP. ${remaining} attempt(s) remaining.` };
  }

  return { valid: true, record };
};

const markVerified = async (record) => {
  record.verified = true;
  await record.save();
};

const resendOtp = async ({ email, ip, userAgent }) => {
  const existing = await Otp.findOne({ email, verified: false }).sort({ createdAt: -1 });
  if (!existing) {
    throw new Error('No pending signup found. Please sign up again.');
  }
  if (existing.resendCount >= OTP_MAX_RESENDS) {
    throw new Error('Maximum resend limit reached. Please try signing up again.');
  }

  const now = Date.now();
  const elapsed = (now - existing.createdAt.getTime()) / 1000;
  if (elapsed < OTP_RESEND_COOLDOWN) {
    const wait = Math.ceil(OTP_RESEND_COOLDOWN - elapsed);
    throw new Error(`Please wait ${wait} seconds before requesting a new OTP.`);
  }

  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);

  existing.hashedOtp = hashedOtp;
  existing.expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);
  existing.attempts = 0;
  existing.resendCount += 1;
  existing.createdAt = new Date();
  await existing.save();

  return otp;
};

module.exports = {
  generateOtp,
  hashOtp,
  createOtpSession,
  verifyOtp,
  markVerified,
  resendOtp,
  OTP_EXPIRY_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_RESENDS,
};
