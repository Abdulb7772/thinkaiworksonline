const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can create projects' });
    const { title, description, clients, startDate, completionDate } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const project = await Project.create({ title, description, clients: clients || [], startDate, completionDate, createdBy: req.user._id });
    const populated = await Project.findById(project._id).populate('clients', 'name email').populate('createdBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find().populate('clients', 'name email').populate('createdBy', 'name email').sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ clients: req.user._id }).populate('clients', 'name email').populate('createdBy', 'name email').sort({ createdAt: -1 });
    }
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('clients', 'name email').populate('createdBy', 'name email');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (req.user.role !== 'admin' && !project.clients.some(c => c._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can update projects' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const { title, description, clients, status, startDate, completionDate } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (clients !== undefined) project.clients = clients;
    if (status !== undefined) project.status = status;
    if (startDate !== undefined) project.startDate = startDate;
    if (completionDate !== undefined) project.completionDate = completionDate;
    await project.save();
    const populated = await Project.findById(project._id).populate('clients', 'name email').populate('createdBy', 'name email');
    res.json(populated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can delete projects' });
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
});

router.get('/customers/list', protect, async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' }, 'name email').sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
