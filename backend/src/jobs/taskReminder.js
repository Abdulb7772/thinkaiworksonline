const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { sendEmail } = require('../services/emailService');

const checkDailyTasks = async () => {
  console.log('⏰ Checking daily tasks for 5PM reminder...');
  const today = new Date().toISOString().split('T')[0];
  const pendingTasks = await Task.find({ date: today, status: { $ne: 'done' } }).populate('assignedTo', 'name email').populate('assignedBy', 'name email');

  for (const task of pendingTasks) {
    const employee = await Employee.findOne({ loginEmail: task.assignedTo.email });
    const admin = task.assignedBy;

    try {
      await sendEmail({
        to: [admin.email, employee?.email || task.assignedTo.email],
        subject: `⏰ Task Reminder: "${task.title}" due today`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f4f7fb;border-radius:14px;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="margin:0;color:#111;">ThinkAIWorks</h1>
              <p style="margin:8px 0 0;color:#e53e3e;font-weight:600;">Task Reminder — Past 5 PM</p>
            </div>
            <p>Hi <strong>${task.assignedTo.name}</strong>,</p>
            <p>Your task <strong>"${task.title}"</strong> assigned for today (${today}) is still <span style="color:#e53e3e;font-weight:600;">${task.status}</span>.</p>
            ${task.description ? `<p style="color:#555;">${task.description}</p>` : ''}
            <p style="margin-top:20px;color:#6b7280;font-size:13px;">Please complete it as soon as possible.</p>
          </div>
        `,
        text: `Task Reminder: "${task.title}" assigned for ${today} is still ${task.status}. Please complete it as soon as possible.`,
      });
      console.log(`✓ Reminder sent for task "${task.title}"`);
    } catch (err) {
      console.error(`✗ Failed to send reminder for task "${task.title}": ${err.message}`);
    }
  }

  if (pendingTasks.length === 0) {
    console.log('✓ No pending tasks for today');
  }
};

const startTaskReminderJob = () => {
  cron.schedule('0 17 * * *', checkDailyTasks, { timezone: 'America/New_York' });
  console.log('📋 Task reminder job scheduled for 5 PM daily');
};

module.exports = { startTaskReminderJob, checkDailyTasks };
