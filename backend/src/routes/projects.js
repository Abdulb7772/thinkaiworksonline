const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can create projects' });
    const { title, description, clients, employees, startDate, completionDate } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const project = await Project.create({ title, description, clients: clients || [], employees: employees || [], startDate, completionDate, createdBy: req.user._id });
    const populated = await Project.findById(project._id).populate('clients', 'name email').populate('employees', 'name email').populate('createdBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    projects = await Project.find().populate('clients', 'name email').populate('employees', 'name email').populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('clients', 'name email').populate('employees', 'name email').populate('createdBy', 'name email');
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
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // customers can only change status on projects they're assigned to
    const isAssignedCustomer = req.user.role === 'customer' && project.clients.some(c => c.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isAssignedCustomer) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, description, clients, employees, status, startDate, completionDate } = req.body;
    if (title !== undefined && req.user.role === 'admin') project.title = title;
    if (description !== undefined) project.description = description;
    if (clients !== undefined && req.user.role === 'admin') project.clients = clients;
    if (employees !== undefined && req.user.role === 'admin') project.employees = employees;
    if (status !== undefined) project.status = status;
    if (startDate !== undefined && req.user.role === 'admin') project.startDate = startDate;
    if (completionDate !== undefined && req.user.role === 'admin') {
      const effectiveStart = startDate !== undefined ? startDate : project.startDate;
      if (effectiveStart && completionDate < effectiveStart) {
        return res.status(400).json({ error: 'Completion date cannot be before start date' });
      }
      project.completionDate = completionDate;
    }
    await project.save();
    const populated = await Project.findById(project._id).populate('clients', 'name email').populate('employees', 'name email').populate('createdBy', 'name email');
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
