const cron = require('node-cron');
const Task = require('../models/Task');
const Employee = require('../models/Employee');
const { sendEmail } = require('../services/emailService');

const checkUpcomingTasks = async () => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const tasks = await Task.find({
    date: today,
    dueTime: { $ne: '' },
    status: { $ne: 'done' },
    reminder2hSent: false,
  }).populate('assignedTo', 'name email').populate('assignedBy', 'name email');

  for (const task of tasks) {
    if (!task.dueTime) continue;
    const [h, m] = task.dueTime.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) continue;
    const dueMinutes = h * 60 + m;
    const diff = dueMinutes - currentMinutes;
    if (diff > 105 && diff <= 125) {
      const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
      const allRecipients = [];
      for (const assignee of assignees) {
        const employee = await Employee.findOne({ loginEmail: assignee.email });
        allRecipients.push(assignee.email);
        if (employee?.email && employee.email !== assignee.email) allRecipients.push(employee.email);
      }
      const uniqueRecipients = [...new Set(allRecipients)];
      try {
        await sendEmail({
          to: uniqueRecipients,
          subject: `⏰ Task Due Soon: "${task.title}" in 2 hours`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f4f7fb;border-radius:14px;">
              <div style="text-align:center;margin-bottom:24px;">
                <h1 style="margin:0;color:#111;">ThinkAIWorks</h1>
                <p style="margin:8px 0 0;color:#e67e22;font-weight:600;">⏰ 2-Hour Reminder</p>
              </div>
              <p>Hi <strong>${assignees.map(a => a.name).join(', ')}</strong>,</p>
              <p>Your task <strong>"${task.title}"</strong> is due in <strong>2 hours</strong> (by ${task.dueTime}).</p>
              ${task.description ? `<p style="color:#555;">${task.description}</p>` : ''}
              <p style="margin-top:20px;color:#6b7280;font-size:13px;">Please make sure to complete it on time.</p>
            </div>
          `,
          text: `Task "${task.title}" is due in 2 hours (by ${task.dueTime}). Please complete it on time.`,
        });
        task.reminder2hSent = true;
        await task.save();
        console.log(`✓ 2h reminder sent for task "${task.title}"`);
      } catch (err) {
        console.error(`✗ Failed to send 2h reminder for task "${task.title}": ${err.message}`);
      }
    }
  }
};

const startTaskReminder2hJob = () => {
  cron.schedule('*/15 * * * *', checkUpcomingTasks, { timezone: 'America/New_York' });
  console.log('📋 Task 2-hour reminder job started (runs every 15 minutes)');
};

module.exports = { startTaskReminder2hJob, checkUpcomingTasks };
