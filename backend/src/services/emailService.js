const { Resend } = require('resend');

let resendInstance = null;

const getResend = () => {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set — add it to your Render environment variables (or .env for local dev)');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const resend = getResend();
  const from = process.env.EMAIL_FROM || 'noreply@yourdomain.com';
  const recipients = Array.isArray(to) ? to : [to];
  const recipientStr = recipients.join(', ');

  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    html,
    text,
  });

  if (error) {
    console.error(`✗ Email failed to ${recipientStr} — subject: "${subject}" — ${error.message}`);
    throw new Error(error.message);
  }

  console.log(`✓ Email sent successfully to ${recipientStr} — subject: "${subject}"`);
  return data;
};

const sendMeetingReminder = async ({ title, datetime, attendees, clientEmail, adminEmails }) => {
  const allRecipients = [
    ...(clientEmail ? [clientEmail.trim()] : []),
    ...(Array.isArray(adminEmails) ? adminEmails.map(e => e.trim()).filter(Boolean) : []),
  ].filter(Boolean);

  if (allRecipients.length === 0) return;

  const timeStr = datetime
    ? new Date(datetime).toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : 'TBD';

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#07080d;border-radius:14px;border:1px solid #242a40;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="margin:0;color:#eceef5;font-size:20px;">ThinkAIWorks</h1>
        <p style="margin:6px 0 0;color:#8890b0;font-size:13px;">Meeting Reminder</p>
      </div>
      <div style="background:#141828;border:1px solid #242a40;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 6px;color:#8890b0;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Starting in 10 minutes</p>
        <h2 style="margin:0 0 12px;color:#eceef5;font-size:18px;">${title}</h2>
        <p style="margin:0 0 6px;color:#8890b0;font-size:13px;">&#128337; ${timeStr}</p>
        ${attendees ? `<p style="margin:0;color:#8890b0;font-size:13px;">&#128100; ${attendees}</p>` : ''}
      </div>
      <p style="color:#4a5070;font-size:12px;text-align:center;margin:0;">This is an automated reminder from the ThinkAIWorks Command Hub.</p>
    </div>
  `;

  await sendEmail({
    to: allRecipients,
    subject: `⏰ Reminder: "${title}" starts in 10 minutes`,
    html,
    text: `Reminder: Your meeting "${title}" starts in 10 minutes at ${timeStr}.${attendees ? ` Attendees: ${attendees}` : ''}`,
  });
};

module.exports = { sendEmail, sendMeetingReminder };
