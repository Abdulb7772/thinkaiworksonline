const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { connectDB, closeDatabase } = require('./config/db');
const apiRoutes = require('./routes');
const { startMeetingReminderJob } = require('./jobs/meetingReminder');
const { startMeetingFollowUpJob } = require('./jobs/meetingFollowUp');
const { startTaskReminderJob } = require('./jobs/taskReminder');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const port = parseInt(process.env.PORT, 10) || 5000;
const mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim().replace(/(^["']|["']$)/g, '').replace(/^\uFEFF/, '');

if (!mongoUri) {
  console.error('MONGO_URI or MONGODB_URI is missing');
  process.exit(1);
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/api', apiRoutes);

app.get('/', (req, res) => res.json({ message: 'ThinkAIWorks Dashboard API' }));
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.name === 'MongooseError' || err.name === 'MongoError' || err.message.includes('buffering')) {
    return res.status(503).json({ 
      error: 'Database is unavailable. Please ensure MongoDB is running.' 
    });
  }
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

let server;

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down...`);
  if (server) await new Promise((r) => server.close(r));
  try { await closeDatabase(); } catch {}
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => { console.error(reason); shutdown('UNHANDLED_REJECTION'); });
process.on('uncaughtException', (error) => { console.error(error); shutdown('UNCAUGHT_EXCEPTION'); });

const startServer = async () => {
  try {
    await connectDB(mongoUri);
  } catch {
    console.warn('MongoDB unavailable — running without database');
  }

  startMeetingReminderJob();
  startMeetingFollowUpJob();
  startTaskReminderJob();
  const tryListen = (p) => {
    server = app.listen(p);
    server.on('listening', () => console.log(`Server running on port ${p}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && p < port + 10) {
        console.warn(`Port ${p} in use, trying ${p + 1}`);
        tryListen(p + 1);
      } else {
        console.error('Failed to start server:', err.message);
        process.exit(1);
      }
    });
  };

  tryListen(port);
};

startServer();
