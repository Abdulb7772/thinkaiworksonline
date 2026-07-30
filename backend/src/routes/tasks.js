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
    const { title, description, assignedTo, date, dueTime, files, project, priority } = req.body;
    const ids = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    if (!title || !ids.length || !date || !project) return res.status(400).json({ error: 'title, assignedTo, date, and project required' });
    const employees = await User.find({ _id: { $in: ids }, role: 'employee' });
    if (employees.length === 0) return res.status(400).json({ error: 'No valid employees' });
    const task = await Task.create({ title, description, assignedTo: ids, assignedBy: req.user._id, date, dueTime, files: files || [], project, priority: priority || 'medium' });

    for (const employee of employees) {
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
              <p style="margin:0;"><strong>Due:</strong> ${date}${dueTime ? ' at ' + dueTime : ''}</p>
            </div>
            <a href="https://www.thinkaiworks.online/" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#7c5cfc;color:#fff;text-decoration:none;font-weight:600;">View Tasks</a>
          </div>
        `,
        text: `New task assigned: ${title}. Due: ${date}${dueTime ? ' at ' + dueTime : ''}. ${description ? `Description: ${description}` : ''}`,
      }).catch(err => console.error('Task assignment email failed:', err.message));
    }

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('project', 'title').populate('comments.user', 'name');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find().populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('project', 'title').populate('comments.user', 'name').sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('project', 'title').populate('comments.user', 'name').sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    const { status, files, comment, dueTime } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (req.user.role !== 'admin') {
      const ids = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
      if (!ids.some(a => a.toString() === req.user._id.toString())) return res.status(403).json({ error: 'Not authorized' });
    }
    if (status) {
      if (!['pending', 'in_progress', 'in_testing', 'done'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
      if (req.user.role !== 'admin') {
        const flow = ['pending', 'in_progress', 'in_testing', 'done'];
        const curIdx = flow.indexOf(task.status);
        const nextIdx = flow.indexOf(status);
        if (nextIdx !== curIdx + 1) return res.status(403).json({ error: 'Employees can only advance status one step at a time' });
      }
      task.status = status;
    }
    if (dueTime !== undefined) {
      task.dueTime = dueTime;
      task.reminder2hSent = false;
      task.reminderEodSent = false;
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

    if (req.user.role === 'employee' && (status || comment)) {
      const admin = await User.findById(task.assignedBy);
      if (admin) {
        const updates = [];
        if (status) updates.push(`Status changed to "${status}"`);
        if (comment) updates.push(`Comment: "${comment}"`);
        sendEmail({
          to: admin.notificationEmail || admin.email,
          subject: `Task Update: "${task.title}"`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f4f7fb;border-radius:14px;">
              <h1 style="margin:0 0 16px;color:#111;font-size:20px;">Task Updated by ${req.user.name}</h1>
              <div style="background:#fff;padding:18px;border-radius:12px;border:1px solid #e2e8f0;margin:20px 0;">
                <p style="margin:0 0 8px;"><strong>Task:</strong> ${task.title}</p>
                ${updates.map(u => `<p style="margin:0 0 4px;">${u}</p>`).join('')}
              </div>
              <a href="https://www.thinkaiworks.online/" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#7c5cfc;color:#fff;text-decoration:none;font-weight:600;">View in Dashboard</a>
            </div>
          `,
          text: `${req.user.name} updated "${task.title}": ${updates.join('. ')}`,
        }).catch(err => console.error('Task update email failed:', err.message));
      }
    }

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('project', 'title').populate('comments.user', 'name');
    res.json(populated);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can edit tasks' });
    const { title, description, assignedTo, date, dueTime, priority, project } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const ids = assignedTo !== undefined ? (Array.isArray(assignedTo) ? assignedTo : [assignedTo]) : task.assignedTo;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = ids;
    if (date !== undefined) task.date = date;
    if (dueTime !== undefined) task.dueTime = dueTime;
    if (priority !== undefined) task.priority = priority;
    if (project !== undefined) task.project = project;
    await task.save();
    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('assignedBy', 'name email').populate('project', 'title').populate('comments.user', 'name');
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
