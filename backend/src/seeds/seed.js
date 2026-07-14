const path = require('path');
const dotenv = require('dotenv');
const { connectDB, closeDatabase } = require('../config/db');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Meeting = require('../models/Meeting');
const Employee = require('../models/Employee');
const Ticket = require('../models/Ticket');
const Campaign = require('../models/Campaign');
const Budget = require('../models/Budget');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sampleLeads = [
  {
    name: 'David Park',
    profileUrl: 'https://www.upwork.com/freelancers/~0123456789abcdef',
    service: 'Amazon FBA',
    company: 'EcomSkyline',
    budgetRange: '$3k–7k',
    priority: 'High',
    brief: 'Need end-to-end FBA management and PPC optimization.',
    assignedTo: 'Sarah K.',
    score: 91,
    status: 'New',
  },
  {
    name: 'Emma Richardson',
    profileUrl: 'https://www.upwork.com/freelancers/~fedcba9876543210',
    service: 'Shopify Development',
    company: 'EcomSkyline',
    budgetRange: '$1k–3k',
    priority: 'Medium',
    brief: 'Launch new brand site with CRO and post-purchase flows.',
    assignedTo: 'Omar H.',
    score: 77,
    status: 'Contacted',
  },
  {
    name: 'Tariq Sultan',
    profileUrl: 'https://www.upwork.com/freelancers/~abcdef0123456789',
    service: 'AI Chatbot',
    company: 'ThinkAIWorks',
    budgetRange: '$5k+',
    priority: 'High',
    brief: 'Build an AI chatbot for support triage and automation.',
    assignedTo: 'Zara T.',
    score: 88,
    status: 'New',
  },
];

const sampleClients = [
  {
    name: 'David Park',
    company: 'EcomSkyline',
    service: 'Amazon FBA',
    value: '$5,200',
    stage: 'Discovery',
    assignedTo: 'Sarah K.',
    lastContact: 'Today',
  },
  {
    name: 'Emma Richardson',
    company: 'EcomSkyline',
    service: 'Shopify Dev',
    value: '$2,800',
    stage: 'Proposal',
    assignedTo: 'Omar H.',
    lastContact: 'Yesterday',
  },
  {
    name: 'Tariq Sultan',
    company: 'ThinkAIWorks',
    service: 'AI Chatbot',
    value: '$6,000',
    stage: 'Negotiation',
    assignedTo: 'Zara T.',
    lastContact: 'Today',
  },
];

const sampleMeetings = [
  {
    title: 'Discovery Call — David Park',
    client: 'David Park',
    datetime: new Date(Date.now() + 1 * 60 * 60 * 1000),
    attendees: 'Sarah K.',
    type: 'Video',
    company: 'EcomSkyline',
  },
  {
    title: 'Project Review — Emma R.',
    client: 'Emma Richardson',
    datetime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    attendees: 'Omar H., Muhammad Ali',
    type: 'Internal',
    company: 'EcomSkyline',
  },
  {
    title: 'AI Demo — Tariq Sultan',
    client: 'Tariq Sultan',
    datetime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    attendees: 'Zara T.',
    type: 'Video',
    company: 'ThinkAIWorks',
  },
];

const sampleEmployees = [
  { name: 'Sarah K.', role: 'Lead Manager', company: 'EcomSkyline', score: 94, tasks: 42, rating: 4.9, attendance: 98, trend: 'up', status: 'Top' },
  { name: 'Omar H.', role: 'Dev Lead', company: 'EcomSkyline', score: 86, tasks: 38, rating: 4.7, attendance: 95, trend: 'up', status: 'Strong' },
  { name: 'Zara T.', role: 'AI Specialist', company: 'ThinkAIWorks', score: 89, tasks: 35, rating: 4.8, attendance: 97, trend: 'up', status: 'Strong' },
  { name: 'Bilal M.', role: 'Marketing', company: 'EcomSkyline', score: 78, tasks: 29, rating: 4.5, attendance: 92, trend: 'stable', status: 'Good' },
  { name: 'Ayesha N.', role: 'Support', company: 'Both', score: 82, tasks: 56, rating: 4.6, attendance: 94, trend: 'up', status: 'Good' },
];

const sampleTickets = [
  { ticketId: '#T-441', client: 'Ali Hassan', issue: 'Invoice discrepancy — charged twice', priority: 'High', company: 'EcomSkyline', status: 'Open' },
  { ticketId: '#T-442', client: 'Emma R.', issue: 'Project deliverable delayed by 2 days', priority: 'High', company: 'EcomSkyline', status: 'Open' },
  { ticketId: '#T-443', client: 'Jennifer Lee', issue: 'AI chatbot not responding on weekends', priority: 'Medium', company: 'ThinkAIWorks', status: 'In Progress' },
];

const sampleCampaigns = [
  { name: 'Amazon Sellers — FBA Mgmt', company: 'EcomSkyline', sent: 186, opens: '44%', replies: '9%', status: 'active' },
  { name: 'Shopify Stores — Scaling', company: 'EcomSkyline', sent: 94, opens: '38%', replies: '7%', status: 'active' },
  { name: 'SaaS Companies — AI Tools', company: 'ThinkAIWorks', sent: 106, opens: '51%', replies: '12%', status: 'active' },
];

const sampleBudgets = [
  { label: 'Upwork Promoted', value: 800, max: 3000, company: 'Both' },
  { label: 'LinkedIn Ads', value: 600, max: 3000, company: 'Both' },
  { label: 'Google Ads', value: 1200, max: 3000, company: 'Both' },
  { label: 'Content / SEO', value: 400, max: 2000, company: 'Both' },
  { label: 'Email Tools', value: 200, max: 1000, company: 'Both' },
];

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@thinkalworks.online',
    password: 'password123',
  },
  {
    name: 'Demo User',
    email: 'demo@thinkalworks.online',
    password: 'password123',
  },
];

const seed = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGO_URI missing. Set it in .env before running the seed script.');
    process.exit(1);
  }

  await connectDB(mongoUri);

  const countPromises = [
    User.countDocuments(),
    Lead.countDocuments(),
    Client.countDocuments(),
    Meeting.countDocuments(),
    Employee.countDocuments(),
    Ticket.countDocuments(),
    Campaign.countDocuments(),
    Budget.countDocuments(),
  ];

  const [userCount, leadCount, clientCount, meetingCount, employeeCount, ticketCount, campaignCount, budgetCount] = await Promise.all(countPromises);

  if (!userCount) await User.insertMany(sampleUsers);
  if (!leadCount) await Lead.insertMany(sampleLeads);
  if (!clientCount) await Client.insertMany(sampleClients);
  if (!meetingCount) await Meeting.insertMany(sampleMeetings);
  if (!employeeCount) await Employee.insertMany(sampleEmployees);
  if (!ticketCount) await Ticket.insertMany(sampleTickets);
  if (!campaignCount) await Campaign.insertMany(sampleCampaigns);
  if (!budgetCount) await Budget.insertMany(sampleBudgets);

  console.log('Seed completed. Current counts:');
  console.log({ userCount: userCount || sampleUsers.length, leadCount: leadCount || sampleLeads.length, clientCount: clientCount || sampleClients.length, meetingCount: meetingCount || sampleMeetings.length, employeeCount: employeeCount || sampleEmployees.length, ticketCount: ticketCount || sampleTickets.length, campaignCount: campaignCount || sampleCampaigns.length, budgetCount: budgetCount || sampleBudgets.length });

  await closeDatabase();
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
