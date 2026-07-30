const express = require('express');
const Client = require('../models/Client');
const User = require('../models/User');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const client = new Client(req.body);
    await client.save();

    const email = (req.body.email || '').trim().toLowerCase();
    if (email) {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        await User.create({ name: req.body.name || email, email, role: 'customer' }).catch(() => {});
      }
    }

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
