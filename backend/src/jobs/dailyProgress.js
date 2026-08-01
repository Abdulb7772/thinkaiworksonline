const cron = require('node-cron');
const Employee = require('../models/Employee');
const { sendEmail } = require('../services/emailService');

const sendDailyProgress = async () => {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) { console.log('📅 Skipping daily progress — weekend'); return; }

  const employees = await Employee.find({}, 'name loginEmail email');
  const allEmails = [...new Set(employees.flatMap(e => [e.loginEmail, e.email].filter(Boolean)))];

  if (allEmails.length === 0) { console.log('📅 No employees to send daily progress to'); return; }

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  await sendEmail({
    to: allEmails,
    subject: `📋 Daily Progress Report — ${dateStr}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0c0e16;border-radius:16px;border:1px solid #242a40;">
        <div style="text-align:center;margin-bottom:28px;">
          <h1 style="margin:0;color:#eceef5;font-size:22px;">ThinkAIWorks</h1>
          <p style="margin:8px 0 0;color:#8890b0;font-size:14px;">Daily Progress Report</p>
          <p style="margin:4px 0 0;color:#5a6090;font-size:12px;">${dateStr}</p>
        </div>
        <div style="background:#141828;border:1px solid #242a40;border-radius:12px;padding:28px 24px;">
          <p style="margin:0 0 16px;color:#eceef5;font-size:16px;font-weight:600;">Hi Team,</p>
          <p style="margin:0 0 16px;color:#8890b0;font-size:14px;line-height:1.6;">
            Please reply to this email with a brief update on what you worked on today. Include:
          </p>
          <ul style="margin:0 0 20px;padding-left:20px;color:#8890b0;font-size:14px;line-height:1.8;">
            <li>Tasks completed today</li>
            <li>Any blockers or issues</li>
            <li>What you're working on next</li>
          </ul>
          <div style="background:#0c0e16;border:1px solid #2e3650;border-radius:10px;padding:16px;">
            <p style="margin:0;color:#5a6090;font-size:12px;">Simply hit <strong style="color:#eceef5;">Reply</strong> and share your update. Keep it short — a few sentences is perfect.</p>
          </div>
        </div>
        <div style="background:rgba(124,92,252,0.08);border:1px solid rgba(124,92,252,0.2);border-radius:10px;padding:14px 18px;margin-top:20px;text-align:center;">
          <p style="margin:0;color:#7c5cfc;font-size:12px;">Thank you for your hard work! — ThinkAIWorks Team</p>
        </div>
        <p style="margin:20px 0 0;color:#4a5070;font-size:11px;text-align:center;">
          Sent from ThinkAIWorks Command Hub · Automated daily check-in
        </p>
      </div>
    `,
    text: `Hi Team,\n\nPlease reply to this email with a brief update on what you worked on today. Include:\n\n- Tasks completed today\n- Any blockers or issues\n- What you're working on next\n\nKeep it short — a few sentences is perfect.\n\nThank you for your hard work! — ThinkAIWorks Team`,
  });

  console.log(`📋 Daily progress email sent to ${allEmails.length} employee(s)`);
};

const startDailyProgressJob = () => {
  cron.schedule('0 18 * * 1-5', sendDailyProgress, { timezone: 'Asia/Karachi' });
  console.log('📋 Daily progress job scheduled for 6 PM Mon-Fri');
};

module.exports = { startDailyProgressJob, sendDailyProgress };
