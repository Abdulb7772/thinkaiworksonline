const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { receiver, message, taskId } = req.body;
    if (!receiver || !message) return res.status(400).json({ error: 'receiver and message required' });
    const chat = await Chat.create({ sender: req.user._id, receiver, message, taskId });
    const populated = await Chat.findById(chat._id).populate('sender', 'name email').populate('receiver', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.get('/:userId', protect, async (req, res, next) => {
  try {
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) return res.status(404).json({ error: 'User not found' });
    const messages = await Chat.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    }).populate('sender', 'name email').populate('receiver', 'name email').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const employees = await User.find({ role: 'employee' }, 'name email').sort({ name: 1 });
      const conversations = [];
      for (const emp of employees) {
        const last = await Chat.findOne({
          $or: [
            { sender: req.user._id, receiver: emp._id },
            { sender: emp._id, receiver: req.user._id },
          ],
        }).sort({ createdAt: -1 });
        conversations.push({ user: emp, lastMessage: last });
      }
      return res.json(conversations);
    }
    const admins = await User.find({ role: 'admin' }, 'name email').sort({ name: 1 });
    const conversations = [];
    for (const admin of admins) {
      const last = await Chat.findOne({
        $or: [
          { sender: req.user._id, receiver: admin._id },
          { sender: admin._id, receiver: req.user._id },
        ],
      }).sort({ createdAt: -1 });
      conversations.push({ user: admin, lastMessage: last });
    }
    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
