const express = require('express');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Meeting = require('../models/Meeting');
const Employee = require('../models/Employee');
const Ticket = require('../models/Ticket');
const Campaign = require('../models/Campaign');
const Budget = require('../models/Budget');
const User = require('../models/User');
const router = express.Router();

function normalizeAttendanceLog(log) {
  if (!log) return {};
  if (log instanceof Map) return Object.fromEntries(log);
  if (typeof log === 'object') return { ...log };
  return {};
}

const tickerItems = [
  'EcomSkyline revenue growing steadily',
  'ThinkAIWorks AI chatbot project active',
  'New leads in pipeline',
];

const buildAppData = async () => {
  let leads = [], clients = [], meetings = [], employees = [], tickets = [], campaigns = [], budgets = [], customers = [];

  try {
    [leads, clients, meetings, employees, tickets, campaigns, budgets, customers] = await Promise.all([
      Lead.find().sort({ createdAt: -1 }).lean().catch(() => []),
      Client.find().sort({ createdAt: -1 }).lean().catch(() => []),
      Meeting.find().sort({ datetime: 1 }).lean().catch(() => []),
      Employee.find().sort({ name: 1 }).lean().catch(() => []),
      Ticket.find().sort({ createdAt: -1 }).lean().catch(() => []),
      Campaign.find().sort({ createdAt: -1 }).lean().catch(() => []),
      Budget.find().sort({ createdAt: -1 }).lean().catch(() => []),
      User.find({ role: 'customer' }).sort({ name: 1 }).lean().catch(() => []),
    ]);
  } catch {}

  const totalSpend = budgets.reduce((s, b) => s + (b.value || 0), 0);
  const totalRev = clients.reduce((s, c) => s + (parseInt(String(c.value || '0').replace(/[^0-9]/g, '')) || 0), 0);
  const esRevenue = 0;
  const taiRevenue = 0;

  return {
    overviewMetrics: {
      es: [
        { label: 'Monthly Revenue', val: `$${esRevenue.toLocaleString()}`, delta: '↑ 22% MoM', cls: 'up', co: 'es' },
        { label: 'Active Clients', val: String(clients.filter(c => c.company === 'EcomSkyline' || !c.company).length || 11), delta: '↑ 2 new', cls: 'up', co: '' },
        { label: 'Upwork Leads', val: String(leads.filter(l => l.company === 'EcomSkyline' || !l.company).length || 28), delta: 'This month', cls: 'neutral', co: '' },
        { label: 'Avg Project Value', val: '$1,650', delta: '↑ $200', cls: 'up', co: '' },
      ],
      tai: [
        { label: 'Monthly Revenue', val: `$${taiRevenue.toLocaleString()}`, delta: '↑ 31% MoM', cls: 'up', co: 'tai' },
        { label: 'Active Clients', val: String(clients.filter(c => c.company === 'ThinkAIWorks').length || 0), delta: 'Current total', cls: 'up', co: '' },
        { label: 'AI Projects Live', val: String(clients.filter(c => c.company === 'ThinkAIWorks' && c.stage === 'Active').length || 0), delta: 'Active stage', cls: 'neutral', co: '' },
        { label: 'Avg Project Value', val: (() => { const taiClients = clients.filter(c => c.company === 'ThinkAIWorks'); const vals = taiClients.map(c => parseInt(String(c.value || '0').replace(/[^0-9]/g, '')) || 0).filter(v => v > 0); return vals.length ? '$' + Math.round(vals.reduce((a, b) => a + b, 0) / vals.length).toLocaleString() : '$0'; })(), delta: 'Per project', cls: 'up', co: '' },
      ],
    },
    clients: clients.map(c => ({
      name: c.name, email: c.email || '', company: c.company || 'EcomSkyline', service: c.service || '',
      value: c.value || '', stage: c.stage || 'Discovery', assignedTo: c.assignedTo || '', lastContact: c.lastContact || '',
    })),
    overviewLeads: leads.slice(0, 5).map(l => ({
      name: l.name, service: l.service || 'N/A', budget: l.budgetRange || 'N/A',
      score: l.score || 0, co: l.company === 'ThinkAIWorks' ? 'tai' : 'es', status: l.status || 'New',
    })),
    schedule: meetings.filter(m => !m.completedAt && !m.cancelledAt).slice(0, 5).map(m => ({
      time: m.datetime ? new Date(m.datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
      title: m.title, type: m.type || 'Meeting', co: m.company === 'ThinkAIWorks' ? 'tai' : 'es',
    })),
    revChart: { data: [12, 15, 11, 18, 22, 19, 28], labels: ['M', 'T', 'W', 'T', 'F', 'S', 'T'] },
    performers: employees.slice(0, 3).map(e => ({
      name: e.name, role: e.role || 'Team', score: e.score || 0, co: e.company === 'ThinkAIWorks' ? 'tai' : 'es',
    })),
    pendingLeads: leads.slice(0, 5).map(l => ({
      name: l.name, budget: l.budgetRange || 'N/A', service: l.service || 'N/A',
      score: l.score || 0, age: l.createdAt ? `${Math.round((Date.now() - new Date(l.createdAt)) / 3600000)}h ago` : 'new',
    })),
    crmMetrics: [
      { label: 'Total Leads', val: String(leads.length), delta: 'Updated live', cls: 'up', co: 'es' },
      { label: 'Active Clients', val: String(clients.length), delta: 'Current total', cls: 'up', co: '' },
      { label: 'Open Tickets', val: String(tickets.filter(t => t.status === 'Open').length), delta: 'Real-time', cls: 'neutral', co: '' },
      { label: 'Pipeline Value', val: `$${clients.reduce((s, c) => s + (parseInt(String(c.value || '0').replace(/[^0-9]/g, '')) || 0), 0).toLocaleString()}`, delta: 'Current total', cls: 'up', co: '' },
    ],
    meetings: meetings.filter(m => !m.completedAt && !m.cancelledAt).slice(0, 10).map(m => ({
      _id: m._id, title: m.title,
      date: m.datetime ? new Date(m.datetime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'TBD',
      datetime: m.datetime ? new Date(m.datetime).toISOString() : null,
      type: m.type || 'Internal', co: m.company ? m.company.toLowerCase().slice(0, 3) === 'thi' ? 'tai' : 'es' : 'es', attendees: m.attendees || '',
    })),
    employees: employees.map(e => ({
      _id: e._id, name: e.name, email: e.email || '', initials: e.name.split(' ').map(p => p[0]).join('').slice(0, 2),
      role: e.role || 'Team', subRole: e.subRole || null, co: e.company === 'ThinkAIWorks' ? 'tai' : e.company === 'Both' ? 'both' : 'es',
      score: e.score || 0, tasks: e.tasks || 0, rating: e.rating || 0,
      attendance: e.attendance || 0, attendanceLog: normalizeAttendanceLog(e.attendanceLog), trend: e.trend || 'stable', status: e.status || 'Good',
    })),
    campaigns: campaigns.map(c => ({
      name: c.name, co: c.company === 'ThinkAIWorks' ? 'tai' : 'es',
      sent: c.sent || 0, opens: c.opens || '0%', replies: c.replies || '0%', status: c.status || 'active',
    })),
    tickets: tickets.map(t => ({
      ticketId: t.ticketId || '#T-000', client: t.client || 'Unknown', issue: t.issue || 'No details',
      priority: t.priority || 'Medium', co: t.company === 'ThinkAIWorks' ? 'tai' : 'es', status: t.status || 'Open',
    })),
    budget: {
      items: budgets.map(b => ({ label: b.label, value: b.value, max: b.max })),
      totals: { spend: totalSpend, profit: totalRev - totalSpend, roi: totalSpend ? `${Math.round((totalRev / totalSpend) * 100)}%` : '0%', rev: totalRev },
    },
    revTrend: (() => { const step = Math.round(totalRev / 6); return Array.from({length:6},(_,i)=>step * (i + 1)); })(),
    customers: customers.map(c => ({
      _id: c._id, name: c.name, email: c.email || '',
      createdAt: c.createdAt,
    })),
    tickerItems,
  };
};

router.get('/app-data', async (req, res, next) => {
  try {
    const data = await buildAppData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/sync-customers', async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('name email').lean();
    let created = 0, skipped = 0;
    for (const c of customers) {
      const exists = await Client.findOne({ email: c.email });
      if (!exists) {
        await Client.create({ name: c.name, email: c.email, company: 'ThinkAIWorks' });
        created++;
      } else {
        skipped++;
      }
    }
    res.json({ message: `Synced ${created} customers, ${skipped} already existed.` });
  } catch (error) { next(error); }
});

router.post('/upwork/submit', async (req, res, next) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json({ message: 'Lead created', lead });
  } catch (error) { next(error); }
});

router.post('/meetings', async (req, res, next) => {
  try {
    const meeting = new Meeting(req.body);
    await meeting.save();
    res.status(201).json({ message: 'Meeting created', meeting });
  } catch (error) { next(error); }
});

router.post('/support/reply', async (req, res) => {
  const replies = [
    'I understand your concern. Let me check your account details and get this resolved within 2 hours.',
    'This is a known issue — our dev team has a fix deploying today. I\'ll follow up once it\'s live.',
    'I\'ve escalated this to our senior team. You\'ll receive an update within 1 business hour.',
    'For this request, send us your preferences and we\'ll customize within 24 hours.',
  ];
  res.json({ reply: replies[Math.floor(Math.random() * replies.length)] });
});

router.post('/ceo/reply', async (req, res) => {
  const prompts = {
    'What is our biggest growth opportunity right now?': 'ThinkAIWorks has the highest upside. Productizing the AI chatbot into a SaaS model could add $8–12k MRR within 90 days.',
    'How are both companies performing vs last month?': `Combined MRR is growing. EcomSkyline drives ~64% of revenue. ThinkAIWorks is growing faster from a smaller base.`,
    'Which employees need my attention?': 'Check the Employee Performance page for at-risk team members and top performers.',
    'What should we prioritize this week?': 'Close high-probability leads, resolve urgent tickets, and move forward on key growth initiatives.',
    'How can we reduce churn?': 'Improve onboarding, weekly progress updates, and faster response times on support tickets.',
    'What marketing should we double down on?': 'Upwork outreach gives the best ROI. Test LinkedIn campaigns for higher-value clients.',
  };
  const question = (req.body.question || '').trim();
  res.json({ reply: prompts[question] || 'Great question. Based on current data, focus on pipeline execution and client retention.' });
});

router.post('/campaigns/launch', async (req, res) => {
  res.json({ message: 'Campaign launched' });
});

module.exports = router;
