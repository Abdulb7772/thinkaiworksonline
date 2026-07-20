const express = require('express');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const Client = require('../models/Client');
const Employee = require('../models/Employee');
const { sendMeetingCreated, sendMeetingFollowUp, sendMeetingCancelled } = require('../services/emailService');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ completedAt: null, cancelledAt: null }).sort({ datetime: 1 });
    res.json(meetings);
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ completedAt: { $ne: null } }, { cancelledAt: { $ne: null } }],
    }).sort({ createdAt: -1 });
    res.json(meetings);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const meeting = new Meeting(req.body);
    await meeting.save();

    const emailData = {
      title: meeting.title, datetime: meeting.datetime, attendees: meeting.attendees, type: meeting.type,
      clientEmails: meeting.clientEmails, creatorEmail: meeting.creatorEmail,
      attendeeEmails: meeting.attendeeEmails, adminEmails: meeting.adminEmails,
      meetingLink: meeting.meetingLink,
    };
    sendMeetingCreated(emailData).catch((err) => console.error('Creation email failed:', err.message));

    res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/complete', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { completedAt: new Date(), followUpSent2h: false },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);

    const emailData = {
      title: meeting.title, datetime: meeting.datetime, attendees: meeting.attendees, type: meeting.type,
      clientEmails: meeting.clientEmails, creatorEmail: meeting.creatorEmail,
      attendeeEmails: meeting.attendeeEmails, adminEmails: meeting.adminEmails,
      meetingLink: meeting.meetingLink,
    };
    sendMeetingFollowUp(emailData).catch((err) => console.error('Follow-up email failed:', err.message));
  } catch (error) {
    next(error);
  }
});

router.put('/:id/cancel', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { cancelledAt: new Date() },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);

    sendMeetingCancelled({
      title: meeting.title, datetime: meeting.datetime, attendees: meeting.attendees, type: meeting.type,
      clientEmails: meeting.clientEmails, creatorEmail: meeting.creatorEmail,
      attendeeEmails: meeting.attendeeEmails, adminEmails: meeting.adminEmails,
      meetingLink: meeting.meetingLink,
    }).catch((err) => console.error('Cancellation email failed:', err.message));
  } catch (error) {
    next(error);
  }
});

router.get('/contacts', async (req, res, next) => {
  try {
    const employees = await Employee.find({}, 'name email loginEmail').lean();
    const employeeContacts = employees.map(e => ({ name: e.name, email: e.loginEmail || e.email || '' })).filter(e => e.email);

    const clients = await Client.find({}, 'name email').lean();
    const clientContacts = clients.map(c => ({ name: c.name, email: c.email || '' })).filter(c => c.email);

    const users = await User.find({ role: 'employee' }, 'name email').lean();
    for (const u of users) {
      if (!employeeContacts.find(e => e.email === u.email)) {
        employeeContacts.push({ name: u.name, email: u.email });
      }
    }

    res.json({ clients: clientContacts, employees: employeeContacts });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ message: 'Meeting deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
