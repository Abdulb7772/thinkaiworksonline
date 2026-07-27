const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');
const { destroyFile } = require('../utils/cloudinary');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can assign tasks' });
    const { title, description, assignedTo, date, files } = req.body;
    if (!title || !assignedTo || !date) return res.status(400).json({ error: 'title, assignedTo, and date required' });
    const employee = await User.findById(assignedTo);
    if (!employee || employee.role !== 'employee') return res.status(400).json({ error: 'Invalid employee' });
    const task = await Task.create({ title, description, assignedTo, assignedBy: req.user._id, date, files: files || [] });

    const to = employee.notificationEmail || employee.email;
    sendEmail({
      to,
      subject: `New Task Assigned: "${title}"`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f4f7fb;border-radius:14px;">
          <h1 style="margin:0 0 16px;color:#111;font-size:20px;">New Task Assigned</h1>
          <p>Hi <strong>${employee.name}</strong>,</p>
          <p>A new task has been assigned to you by <strong>${req.user.name}</strong>.</p>
          <div style="background:#fff;padding:18px;border-radius:12px;border:1px solid #e2e8f0;margin:20px 0;">
            <p style="margin:0 0 8px;"><strong>Task:</strong> ${title}</p>
            ${description ? `<p style="margin:0 0 8px;"><strong>Description:</strong> ${description}</p>` : ''}
            <p style="margin:0;"><strong>Due:</strong> ${date}</p>
          </div>
          <a href="https://www.thinkaiworks.online/" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#7c5cfc;color:#fff;text-decoration:none;font-weight:600;">View Tasks</a>
        </div>
      `,
      text: `New task assigned: ${title}. Due: ${date}. ${description ? `Description: ${description}` : ''}`,
    }).catch(err => console.error('Task assignment email failed:', err.message));

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find().populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('comments.user', 'name').sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('comments.user', 'name').sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const { status, files, comment } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (status) {
      if (!['pending', 'in_progress', 'in_testing', 'done'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
      task.status = status;
    }
    if (files !== undefined) {
      if (task.files) {
        for (const f of task.files) {
          if (!files.some(nf => nf.public_id === f.public_id)) {
            destroyFile(f.public_id).catch(() => {});
          }
        }
      }
      task.files = files;
    }
    if (comment) {
      task.comments.push({ text: comment, user: req.user._id });
    }
    await task.save();
    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('comments.user', 'name');
    res.json(populated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can delete tasks' });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    for (const f of task.files || []) {
      destroyFile(f.public_id).catch(() => {});
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

router.get('/employees', protect, async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee' }, 'name email notificationEmail').sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
