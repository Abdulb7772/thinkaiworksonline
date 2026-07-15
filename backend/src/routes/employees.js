const express = require('express');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');
const router = express.Router();

function calcScore(tasks, rating, attendance) {
  const t = Math.min((tasks || 0) / 20, 1) * 30;
  const r = ((rating || 0) / 5) * 40;
  const a = ((attendance || 0) / 100) * 30;
  return Math.round(t + r + a);
}

function calcStatus(score) {
  if (score >= 90) return 'Top';
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Good';
  return 'Risk';
}

function parseStatus(v) { return typeof v === 'string' ? v.split('|')[0] : 'absent'; }
function logValues(log) { return Object.values(log).map(parseStatus); }

function calcAttendanceFromLog(log) {
  if (!log || typeof log !== 'object') return 0;
  const vals = logValues(log);
  if (!vals.length) return 0;
  return Math.round((vals.filter(v => v === 'present').length / vals.length) * 100);
}

function normalizeAttendanceLog(log) {
  if (!log) return {};
  if (log instanceof Map) return Object.fromEntries(log);
  if (typeof log === 'object') return { ...log };
  return {};
}

function parseAttendanceEntry(entry) {
  if (typeof entry !== 'string' || !entry) return null;
  const [status = '', checkin = '', checkout = ''] = entry.split('|');
  return { status, checkin, checkout, raw: entry };
}

function getEntryForDate(log, date) {
  return parseAttendanceEntry(log?.[date]);
}

async function upsertSelfAttendance(req, res, next) {
  try {
    const { attendanceLog = {}, email, name, role, subRole, company } = req.body || {};
    const userEmail = (email || req.user?.email || '').trim().toLowerCase();
    const userName = (name || req.user?.name || '').trim();
    if (!userEmail) return res.status(400).json({ error: 'Email is required' });

    const [date, nextEntry] = Object.entries(attendanceLog)[0] || [];
    if (!date || !nextEntry) {
      return res.status(400).json({ error: 'Attendance entry is required' });
    }

    const existing = await Employee.findOne({ email: userEmail });
    const existingLog = normalizeAttendanceLog(existing?.attendanceLog);
    const currentEntry = getEntryForDate(existingLog, date);

    if (currentEntry?.status === 'present' && currentEntry.checkin && currentEntry.checkout) {
      return res.status(400).json({ error: 'Attendance already completed for today' });
    }

    if (currentEntry?.status === 'absent') {
      return res.status(400).json({ error: 'Attendance already marked absent for today' });
    }

    const nextParts = parseAttendanceEntry(nextEntry);
    if (!nextParts || nextParts.status !== 'present') {
      return res.status(400).json({ error: 'Invalid attendance entry' });
    }

    if (currentEntry?.status === 'present' && currentEntry.checkin && !currentEntry.checkout) {
      if (!nextParts.checkin || nextParts.checkin !== currentEntry.checkin || !nextParts.checkout) {
        return res.status(400).json({ error: 'You can only check out after checking in' });
      }
    }

    if (currentEntry?.status === 'present' && currentEntry.checkin && currentEntry.checkout && nextParts.checkin) {
      return res.status(400).json({ error: 'You cannot check in again after checking out today' });
    }

    if (!currentEntry && !nextParts.checkin) {
      return res.status(400).json({ error: 'You must check in before checking out' });
    }

    const baseData = {
      name: userName || existing?.name || userEmail,
      email: userEmail,
      role: role || existing?.role || req.user?.role || 'Team',
      subRole: subRole || existing?.subRole || null,
      company: company || existing?.company || 'ThinkAIWorks',
    };

    const mergedLog = { ...existingLog, [date]: nextEntry };
    const attendance = calcAttendanceFromLog(mergedLog);
    const tasks = req.body?.tasks ?? existing?.tasks ?? 0;
    const rating = req.body?.rating ?? existing?.rating ?? 0;
    const score = calcScore(tasks, rating, attendance);
    const status = calcStatus(score);

    const update = {
      ...baseData,
      tasks,
      rating,
      attendance,
      score,
      status,
      trend: existing?.trend || 'stable',
      attendanceLog: mergedLog,
    };

    const employee = existing
      ? await Employee.findByIdAndUpdate(existing._id, update, { new: true })
      : await Employee.create(update);

    res.json(employee);
  } catch (error) {
    next(error);
  }
}

router.get('/', async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

router.put('/self-attendance', protect, upsertSelfAttendance);
router.post('/self-attendance', protect, upsertSelfAttendance);

router.post('/', async (req, res, next) => {
  try {
    const { tasks = 0, rating = 0 } = req.body;
    const attendanceLog = req.body.attendanceLog || {};
    const attendance = calcAttendanceFromLog(attendanceLog);
    const score = calcScore(tasks, rating, attendance);
    const status = calcStatus(score);
    const employee = new Employee({ ...req.body, score, trend: 'stable', status, tasks, rating, attendance, attendanceLog });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const existing = await Employee.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Employee not found' });

    const mergedLog = { ...(existing.attendanceLog ? Object.fromEntries(existing.attendanceLog) : {}), ...(req.body.attendanceLog || {}) };
    const attendance = Object.keys(req.body.attendanceLog || {}).length ? calcAttendanceFromLog(mergedLog) : (req.body.attendance ?? existing.attendance);

    const tasks = req.body.tasks ?? existing.tasks;
    const rating = req.body.rating ?? existing.rating;
    const score = calcScore(tasks, rating, attendance);
    const status = calcStatus(score);

    let trend = req.body.trend || existing.trend;
    const prevScore = calcScore(existing.tasks, existing.rating, existing.attendance);
    if (score !== prevScore) {
      trend = score > prevScore ? 'up' : 'down';
    }

    const update = { score, status, trend, attendance };
    if (req.body.email !== undefined) update.email = req.body.email;
    if (req.body.name !== undefined) update.name = req.body.name;
    if (req.body.role !== undefined) update.role = req.body.role;
    if (req.body.subRole !== undefined) update.subRole = req.body.subRole;
    if (req.body.company !== undefined) update.company = req.body.company;
    if (req.body.tasks !== undefined) update.tasks = req.body.tasks;
    if (req.body.rating !== undefined) update.rating = req.body.rating;
    if (req.body.attendanceLog !== undefined) update.attendanceLog = mergedLog;

    const employee = await Employee.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(employee);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
