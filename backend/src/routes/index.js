const express = require('express');
const router = express.Router();

const leadRoutes = require('./leads');
const clientRoutes = require('./clients');
const meetingRoutes = require('./meetings');
const employeeRoutes = require('./employees');
const ticketRoutes = require('./tickets');
const campaignRoutes = require('./campaigns');
const budgetRoutes = require('./budgets');
const dashboardRoutes = require('./dashboard');
const authRoutes = require('./auth');
const supportRoutes = require('./support');

router.use('/auth', authRoutes);
router.use('/auth/create-employee', require('./createEmployee'));
router.use('/leads', leadRoutes);
router.use('/clients', clientRoutes);
router.use('/meetings', meetingRoutes);
router.use('/employees', employeeRoutes);
router.use('/tickets', ticketRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/budgets', budgetRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/support', supportRoutes);
router.use('/ceo', require('./ceo'));

module.exports = router;
