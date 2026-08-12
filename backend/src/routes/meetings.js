const express = require('express');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const Client = require('../models/Client');
const Employee = require('../models/Employee');
const { sendMeetingCreated, sendMeetingFollowUp, sendMeetingCancelled, sendMeetingUpdated } = require('../services/emailService');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

const toArr = (v) => Array.isArray(v) ? v : (v === undefined || v === null ? [] : [v]);

const normalizeParticipants = (clients = [], attendees = []) => {
  const clean = (arr) => {
    const seen = new Set();
    const out = [];
    for (const p of toArr(arr)) {
      const email = String(p?.email || '').trim().toLowerCase();
      if (!email || seen.has(email)) continue;
      seen.add(email);
      out.push({ id: p?.id || null, name: String(p?.name || '').trim(), email, external: !!p?.external });
    }
    return out;
  };
  return { clients: clean(clients), attendees: clean(attendees) };
};

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
    const { clients: clientArr, attendees: attendeeArr } = req.body;
    const normalized = normalizeParticipants(clientArr, attendeeArr);

    const legacyClientEmails = req.body.clientEmails !== undefined ? toArr(req.body.clientEmails).map(e => String(e).trim().toLowerCase()).filter(Boolean) : normalized.clients.map(c => c.email);
    const legacyAttendeeEmails = req.body.attendeeEmails !== undefined ? toArr(req.body.attendeeEmails).map(e => String(e).trim().toLowerCase()).filter(Boolean) : normalized.attendees.map(a => a.email);

    if (normalized.clients.length === 0 && legacyClientEmails.length === 0) {
      return res.status(400).json({ error: 'At least one client is required' });
    }
    if (normalized.attendees.length === 0 && legacyAttendeeEmails.length === 0) {
      return res.status(400).json({ error: 'At least one attendee is required' });
    }

    const meeting = new Meeting({
      ...req.body,
      clients: normalized.clients,
      attendeeList: normalized.attendees,
      clientEmails: legacyClientEmails,
      attendeeEmails: legacyAttendeeEmails,
    });
    await meeting.save();

    const emailData = {
      title: meeting.title, datetime: meeting.datetime, attendees: meeting.attendees, type: meeting.type,
      clientEmails: meeting.clientEmails, creatorEmail: meeting.creatorEmail,
      attendeeEmails: meeting.attendeeEmails, adminEmails: meeting.adminEmails,
      meetingLink: meeting.meetingLink,
      clients: meeting.clients, attendeeList: meeting.attendeeList,
    };
    sendMeetingCreated(emailData).catch((err) => console.error('Creation email failed:', err.message));

    res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
});

const buildContacts = (employeeDocs, employeeUserDocs, clientDocs, customerUserDocs) => {
  const employees = [];
  const clients = [];
  const seenE = new Set();
  const seenC = new Set();

  for (const e of employeeDocs) {
    const primary = String(e.email || '').trim().toLowerCase() || String(e.loginEmail || '').trim().toLowerCase();
    if (!primary || seenE.has(primary)) continue;
    employees.push({ id: String(e._id), name: e.name, email: primary });
    seenE.add(primary);
    const secondary = String(e.loginEmail || '').trim().toLowerCase();
    if (secondary) seenE.add(secondary);
  }
  for (const u of employeeUserDocs) {
    const email = String(u.email || '').trim().toLowerCase();
    if (!email || seenE.has(email)) continue;
    employees.push({ id: String(u._id), name: u.name, email });
    seenE.add(email);
  }

  for (const c of clientDocs) {
    const email = String(c.email || '').trim().toLowerCase();
    if (!email || seenC.has(email)) continue;
    clients.push({ id: String(c._id), name: c.name, email });
    seenC.add(email);
  }
  for (const u of customerUserDocs) {
    const email = String(u.email || '').trim().toLowerCase();
    if (!email || seenC.has(email)) continue;
    clients.push({ id: String(u._id), name: u.name, email });
    seenC.add(email);
  }

  return { clients, employees };
};

router.get('/contacts', async (req, res, next) => {
  try {
    const [employeeDocs, employeeUserDocs, clientDocs, customerUserDocs] = await Promise.all([
      Employee.find({}, 'name email loginEmail').lean(),
      User.find({ role: 'employee' }, 'name email').lean(),
      Client.find({}, 'name email').lean(),
      User.find({ role: 'customer' }, 'name email').lean(),
    ]);

    res.json(buildContacts(employeeDocs, employeeUserDocs, clientDocs, customerUserDocs));
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
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    if (req.body.clients || req.body.attendees) {
      const normalized = normalizeParticipants(req.body.clients, req.body.attendees);
      meeting.clients = normalized.clients;
      meeting.attendeeList = normalized.attendees;
      meeting.clientEmails = normalized.clients.map(c => c.email);
      meeting.attendeeEmails = normalized.attendees.map(a => a.email);
    }
    for (const key of ['title', 'datetime', 'type', 'company', 'creatorEmail', 'meetingLink', 'attendees', 'adminEmails']) {
      if (req.body[key] !== undefined) meeting[key] = req.body[key];
    }
    await meeting.save();

    sendMeetingUpdated({
      title: meeting.title, datetime: meeting.datetime, attendees: meeting.attendees, type: meeting.type,
      clientEmails: meeting.clientEmails, creatorEmail: meeting.creatorEmail,
      attendeeEmails: meeting.attendeeEmails, adminEmails: meeting.adminEmails,
      meetingLink: meeting.meetingLink,
      clients: meeting.clients, attendeeList: meeting.attendeeList,
    }).catch((err) => console.error('Update email failed:', err.message));

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
      clients: meeting.clients, attendeeList: meeting.attendeeList,
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
      clients: meeting.clients, attendeeList: meeting.attendeeList,
    }).catch((err) => console.error('Cancellation email failed:', err.message));
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
module.exports.normalizeParticipants = normalizeParticipants;
module.exports.buildContacts = buildContacts;
