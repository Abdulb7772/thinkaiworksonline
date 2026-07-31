const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail, taskUpdateHtml, taskUpdateText } = require('../services/emailService');
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
        replyTo: req.user.notificationEmail || req.user.email,
        subject: `New Task Assigned: "${title}"`,
        html: taskUpdateHtml({
          heading: 'New Task Assigned',
          lines: [
            `Hi <strong>${employee.name}</strong>,`,
            `A new task has been assigned to you by <strong>${req.user.name}</strong>.`,
            `<strong>Task:</strong> ${title}`,
            ...(description ? [`<strong>Description:</strong> ${description}`] : []),
            `<strong>Due:</strong> ${date}${dueTime ? ' at ' + dueTime : ''}`,
          ],
        }),
        text: taskUpdateText({
          heading: `New task assigned: "${title}"`,
          lines: [`Assigned by: ${req.user.name}`, `Due: ${date}${dueTime ? ' at ' + dueTime : ''}`, ...(description ? [`Description: ${description}`] : [])],
        }),
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
    const { status, files, comment, dueTime, deleteFile, deleteComment } = req.body;
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
            destroyFile(f.public_id, f.resource_type).catch(() => {});
          }
        }
      }
      task.files = files;
    }
    let deletedFile = null;
    if (deleteFile) {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can delete files' });
      const file = (task.files || []).find(f => f.public_id === deleteFile);
      if (file) {
        destroyFile(file.public_id, file.resource_type).catch(() => {});
        task.files = task.files.filter(f => f.public_id !== deleteFile);
        deletedFile = file;
      }
    }
    if (deleteComment) {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can delete comments' });
      task.comments = task.comments.filter(c => String(c._id) !== String(deleteComment));
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
          replyTo: req.user.notificationEmail || req.user.email,
          subject: `Task Update: "${task.title}"`,
          html: taskUpdateHtml({
            heading: `Task updated by ${req.user.name}`,
            lines: [`<strong>Task:</strong> ${task.title}`, ...updates.map(u => u)],
          }),
          text: taskUpdateText({ heading: `Task updated by ${req.user.name}: "${task.title}"`, lines: updates }),
        }).catch(err => console.error('Task update email failed:', err.message));
      }
    }

    if (req.user.role === 'admin' && deletedFile) {
      const employees = await User.find({ _id: { $in: task.assignedTo } });
      for (const employee of employees) {
        sendEmail({
          to: employee.notificationEmail || employee.email,
          replyTo: req.user.notificationEmail || req.user.email,
          subject: `File removed from task: "${task.title}"`,
          html: taskUpdateHtml({
            heading: 'File removed from task',
            lines: [
              `<strong>Task:</strong> ${task.title}`,
              `<strong>File:</strong> ${deletedFile.name}`,
              `<strong>Removed by:</strong> ${req.user.name}`,
            ],
          }),
          text: taskUpdateText({ heading: `File removed from task "${task.title}"`, lines: [`File: ${deletedFile.name}`, `Removed by: ${req.user.name}`] }),
        }).catch(err => console.error('File removal email failed:', err.message));
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
      destroyFile(f.public_id, f.resource_type).catch(() => {});
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
