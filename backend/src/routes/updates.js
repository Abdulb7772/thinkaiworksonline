const express = require('express');
const UpdateEntry = require('../models/UpdateEntry');
const { isDBConnected } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

const FIELDS = ['platform', 'profile', 'niche', 'clientName', 'description', 'pInvite', 'doi', 'date', 'status', 'fu1', 'fu2', 'response', 'order'];

router.get('/', async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ error: 'Database unavailable.' });
    const entries = await UpdateEntry.find().sort({ order: 1, createdAt: 1 });
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ error: 'Database unavailable.' });
    const body = {};
    for (const f of FIELDS) {
      if (f === 'order') body.order = Number(req.body.order) || 0;
      else if (req.body[f] !== undefined) body[f] = String(req.body[f] ?? '');
    }
    const entry = await UpdateEntry.create(body);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ error: 'Database unavailable.' });
    const patch = {};
    for (const f of FIELDS) {
      if (req.body[f] !== undefined) patch[f] = String(req.body[f] ?? '');
    }
    const entry = await UpdateEntry.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!entry) return res.status(404).json({ error: 'Entry not found.' });
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isDBConnected()) return res.status(503).json({ error: 'Database unavailable.' });
    const entry = await UpdateEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found.' });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
