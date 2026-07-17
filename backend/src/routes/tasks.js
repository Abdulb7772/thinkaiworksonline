const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can assign tasks' });
    const { title, description, assignedTo, date } = req.body;
    if (!title || !assignedTo || !date) return res.status(400).json({ error: 'title, assignedTo, and date required' });
    const employee = await User.findById(assignedTo);
    if (!employee || employee.role !== 'employee') return res.status(400).json({ error: 'Invalid employee' });
    const task = await Task.create({ title, description, assignedTo, assignedBy: req.user._id, date });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find().populate('assignedTo', 'name email').populate('assignedBy', 'name email').sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email').populate('assignedBy', 'name email').sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'in_progress', 'done'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    task.status = status;
    await task.save();
    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.get('/employees', protect, async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee' }, 'name email').sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
