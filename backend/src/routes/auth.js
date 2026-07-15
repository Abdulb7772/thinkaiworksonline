const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const { protect } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/register', async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ 
        error: 'Database unavailable. Contact administrator.' 
      });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: role || 'customer' });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ 
        error: 'Database unavailable. Please try again in a moment or contact support.' 
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
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
      return res.status(400).json({ error: 'Please provide current and new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-token', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

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
    const user = await User.findOne({ email });
    if (!user) return res.json(null);
    res.json({ id: user._id.toString(), name: user.name, email: user.email });
  } catch (error) {
    next(error);
  }
});

router.post('/verification-token', async (req, res, next) => {
  try {
    const { identifier, token, expires } = req.body;
    if (!identifier || !token || !expires) return res.status(400).json({ error: 'Missing fields' });
    await VerificationToken.create({ identifier, token, expires: new Date(expires) });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.post('/verification-token/use', async (req, res, next) => {
  try {
    const { identifier, token } = req.body;
    const doc = await VerificationToken.findOne({ identifier, token });
    if (!doc) return res.json(null);
    await VerificationToken.deleteOne({ _id: doc._id });
    res.json({ identifier: doc.identifier, token: doc.token, expires: doc.expires });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
