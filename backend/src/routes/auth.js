const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const { protect } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');
const { sendOtpEmail } = require('../services/emailService');
const { createOtpSession, verifyOtp, markVerified, resendOtp } = require('../services/otpService');

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many signup attempts. Try again in 15 minutes.' },
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many verification attempts. Try again in 15 minutes.' },
});

const resendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { error: 'Please wait before requesting a new code.' },
});

router.post('/register', signupLimiter, async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const otp = await createOtpSession({
      email: normalizedEmail,
      name,
      password,
      role: role || 'customer',
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    await sendOtpEmail({ to: normalizedEmail, otp, name });

    res.json({
      message: 'Verification code sent to your email.',
      email: normalizedEmail,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    next(error);
  }
});

router.post('/verify-otp', verifyLimiter, async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const result = await verifyOtp(normalizedEmail, otp);
    if (!result.valid) {
      return res.status(400).json({ error: result.reason });
    }

    const { record } = result;
    const { name, password, role } = record.pendingData;

    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      if (password) { user.password = password; }
      user.name = name;
      user.role = role;
      user.emailVerified = true;
      await user.save();
    } else {
      user = await User.create({ name, email: normalizedEmail, password, role, emailVerified: true });
    }

    if (user.role === 'customer') {
      const exists = await Client.findOne({ email: normalizedEmail });
      if (!exists) {
        await Client.create({ name: user.name, email: normalizedEmail, company: 'ThinkAIWorks' });
      }
    }

    await markVerified(record);

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    next(error);
  }
});

router.post('/resend-otp', resendLimiter, async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otp = await resendOtp({
      email: normalizedEmail,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    await sendOtpEmail({ to: normalizedEmail, otp });

    res.json({ message: 'New verification code sent.' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.emailVerified === false) {
      const otp = await createOtpSession({
        email: user.email,
        name: user.name,
        password: password,
        role: user.role,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
      await sendOtpEmail({ to: user.email, otp, name: user.name });
      return res.status(401).json({ error: 'Please verify your email.', needsVerification: true, email: user.email });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    next(error);
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

router.post('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide current and new password.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-token', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

router.post('/adapter-user', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.json(null);
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.json(null);
    res.json({ id: user._id.toString(), name: user.name, email: user.email });
  } catch (error) {
    next(error);
  }
});

router.post('/verification-token', async (req, res, next) => {
  try {
    const { identifier, token, expires } = req.body;
    if (!identifier || !token || !expires) return res.status(400).json({ error: 'Missing fields.' });
    const VerificationToken = require('../models/VerificationToken');
    await VerificationToken.create({ identifier, token, expires: new Date(expires) });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/verification-token/use', async (req, res, next) => {
  try {
    const { identifier, token } = req.body;
    const VerificationToken = require('../models/VerificationToken');
    const doc = await VerificationToken.findOne({ identifier, token });
    if (!doc) return res.json(null);
    await VerificationToken.deleteOne({ _id: doc._id });
    res.json({ identifier: doc.identifier, token: doc.token, expires: doc.expires });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
