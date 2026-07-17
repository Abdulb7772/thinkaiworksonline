const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

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
  const from = process.env.EMAIL_FROM || 'noreply@thinkaiworks.online';
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

const meetingHtml = ({ title, datetime, attendees, meetingLink, bodyContent, creatorEmail, type }) => {
  const timeStr = datetime
    ? new Date(datetime).toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : 'TBD';

  const joinBtn = meetingLink
    ? `<a href="${meetingLink}" style="display:inline-block;padding:12px 28px;background:#7c5cfc;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.3px;">Join with Zoom →</a>`
    : '';

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:580px;margin:0 auto;background:#0b0d17;border-radius:16px;border:1px solid #1e2340;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#141828 0%,#0b0d17 100%);padding:32px 36px 20px;text-align:center;border-bottom:1px solid #1e2340;">
        <h1 style="margin:0;color:#eceef5;font-size:22px;font-weight:700;letter-spacing:-0.3px;">ThinkAIWorks</h1>
        <p style="margin:4px 0 0;color:#5a6090;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Meeting Invitation</p>
      </div>
      <div style="padding:28px 36px;">
        <div style="background:#141828;border:1px solid #1e2340;border-radius:14px;padding:24px;">
          <div style="display:inline-block;background:rgba(124,92,252,0.12);border:1px solid rgba(124,92,252,0.25);border-radius:8px;padding:4px 12px;margin-bottom:16px;">
            <span style="color:#7c5cfc;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">${type || 'Meeting'}</span>
          </div>
          <h2 style="margin:0 0 20px;color:#eceef5;font-size:20px;font-weight:700;line-height:1.3;">${title}</h2>

          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;width:28px;vertical-align:top;">
                <span style="font-size:16px;">📅</span>
              </td>
              <td style="padding:8px 0;color:#8890b0;font-size:13px;vertical-align:top;">
                <span style="color:#eceef5;font-weight:600;">${timeStr}</span>
              </td>
            </tr>
            ${creatorEmail ? `
            <tr>
              <td style="padding:8px 0;width:28px;vertical-align:top;">
                <span style="font-size:16px;">👤</span>
              </td>
              <td style="padding:8px 0;color:#8890b0;font-size:13px;vertical-align:top;">
                Organized by <span style="color:#eceef5;">${creatorEmail}</span>
              </td>
            </tr>` : ''}
            ${attendees ? `
            <tr>
              <td style="padding:8px 0;width:28px;vertical-align:top;">
                <span style="font-size:16px;">👥</span>
              </td>
              <td style="padding:8px 0;color:#8890b0;font-size:13px;vertical-align:top;">
                Attendees: <span style="color:#eceef5;">${attendees}</span>
              </td>
            </tr>` : ''}
          </table>
        </div>

        ${joinBtn ? `
        <div style="text-align:center;margin:24px 0 8px;">
          ${joinBtn}
          <p style="margin:10px 0 0;color:#5a6090;font-size:12px;">Click the button above to join the meeting</p>
        </div>` : ''}

        ${bodyContent || ''}
      </div>
      <div style="background:#141828;padding:18px 36px;text-align:center;border-top:1px solid #1e2340;">
        <p style="margin:0;color:#4a5070;font-size:11px;">
          Sent from ThinkAIWorks Command Hub &middot; Automated meeting notification
        </p>
      </div>
    </div>
  `;
};

const getRecipients = ({ clientEmails, creatorEmail, attendeeEmails, adminEmails }) => [
  ...(Array.isArray(clientEmails) ? clientEmails.map(e => e.trim()).filter(Boolean) : []),
  ...(creatorEmail ? [creatorEmail.trim()] : []),
  ...(Array.isArray(attendeeEmails) ? attendeeEmails.map(e => e.trim()).filter(Boolean) : []),
  ...(Array.isArray(adminEmails) ? adminEmails.map(e => e.trim()).filter(Boolean) : []),
].filter(Boolean);

const sendMeetingReminder = async ({ title, datetime, attendees, type, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink }) => {
  const allRecipients = getRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails });
  if (allRecipients.length === 0) return;

  const allEmails = [
    ...(Array.isArray(clientEmails) ? clientEmails : []),
    ...(Array.isArray(attendeeEmails) ? attendeeEmails : []),
  ];
  const attendeesStr = allEmails.length > 0 ? allEmails.join(', ') : (attendees || '');

  const html = meetingHtml({ title, datetime, attendees: attendeesStr, meetingLink, creatorEmail, type, bodyContent: '<div style="background:rgba(245,200,66,0.08);border:1px solid rgba(245,200,66,0.2);border-radius:10px;padding:12px 18px;margin-top:20px;text-align:center;"><p style="margin:0;color:#f5c842;font-size:13px;font-weight:600;">⏰ Starting in 10 minutes — see you there!</p></div>' });

  await sendEmail({
    to: allRecipients,
    subject: `⏰ Reminder: "${title}" starts in 10 minutes`,
    html,
    text: `Reminder: Your meeting "${title}" starts in 10 minutes at ${datetime ? new Date(datetime).toLocaleString() : 'TBD'}.${attendeesStr ? ` Attendees: ${attendeesStr}` : ''}${meetingLink ? ` Join: ${meetingLink}` : ''}`,
  });
};

const sendMeetingCreated = async ({ title, datetime, attendees, type, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink }) => {
  const allRecipients = getRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails });
  if (allRecipients.length === 0) return;

  const allEmails = [
    ...(Array.isArray(clientEmails) ? clientEmails : []),
    ...(Array.isArray(attendeeEmails) ? attendeeEmails : []),
  ];
  const attendeesStr = allEmails.length > 0 ? allEmails.join(', ') : (attendees || '');

  const html = meetingHtml({
    title, datetime, attendees: attendeesStr, meetingLink, creatorEmail, type,
    bodyContent: '<div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:10px;padding:12px 18px;margin-top:20px;text-align:center;"><p style="margin:0;color:#34d399;font-size:13px;font-weight:600;">✅ Meeting has been scheduled</p></div>',
  });

  await sendEmail({
    to: allRecipients,
    subject: `📅 Meeting Created: "${title}"`,
    html,
    text: `Meeting "${title}" has been created for ${datetime ? new Date(datetime).toLocaleString() : 'TBD'}.${attendeesStr ? ` Attendees: ${attendeesStr}` : ''}${meetingLink ? ` Join: ${meetingLink}` : ''}`,
  });
};

const sendMeetingFollowUp = async ({ title, datetime, attendees, type, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink }) => {
  const allRecipients = getRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails });
  if (allRecipients.length === 0) return;

  const allEmails = [
    ...(Array.isArray(clientEmails) ? clientEmails : []),
    ...(Array.isArray(attendeeEmails) ? attendeeEmails : []),
  ];
  const attendeesStr = allEmails.length > 0 ? allEmails.join(', ') : (attendees || '');

  const bodyContent = `
    <div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:10px;padding:16px 20px;margin-top:20px;text-align:center;">
      <p style="margin:0 0 4px;color:#34d399;font-size:14px;font-weight:600;">Thank you for your time</p>
      <p style="margin:0;color:#8890b0;font-size:13px;">We hope the meeting was productive.</p>
    </div>
    ${meetingLink ? `<div style="text-align:center;margin:20px 0 0;"><a href="${meetingLink}" style="display:inline-block;padding:12px 28px;background:#7c5cfc;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;">Join with Zoom →</a></div>` : ''}
  `;

  const html = meetingHtml({ title, datetime, attendees: attendeesStr, meetingLink, creatorEmail, type, bodyContent });

  await sendEmail({
    to: allRecipients,
    subject: `📋 Meeting Follow-Up: "${title}"`,
    html,
    text: `Thank you for attending "${title}".${meetingLink ? ` Rejoin: ${meetingLink}` : ''}`,
  });
};

const sendMeetingFollowUp2h = async ({ title, datetime, attendees, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink }) => {
  const allRecipients = getRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails });
  if (allRecipients.length === 0) return;

  const bodyContent = `
    <div style="background:rgba(124,92,252,0.08);border:1px solid rgba(124,92,252,0.2);border-radius:10px;padding:18px;margin-bottom:16px;">
      <p style="margin:0 0 10px;color:#eceef5;font-size:14px;font-weight:600;">Hope the meeting went well!</p>
      <p style="margin:0 0 10px;color:#8890b0;font-size:13px;">We'd love to continue the conversation. If you'd like to schedule another meeting or explore how we can help further, simply reply to this email or reach out to us.</p>
      <p style="margin:0 0 10px;color:#8890b0;font-size:13px;">Best regards,<br/>The ThinkAIWorks Team</p>
      <p style="margin:0;color:#f5c842;font-size:13px;">💬 Interested in scheduling another meeting? Let us know!</p>
    </div>
    ${meetingLink ? `<p style="text-align:center;margin:0;"><a href="${meetingLink}" style="display:inline-block;padding:10px 20px;background:#7c5cfc;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">&#128279; Rejoin Meeting</a></p>` : ''}
  `;

  const html = meetingHtml({ title, datetime, attendees, meetingLink, bodyContent });

  await sendEmail({
    to: allRecipients,
    subject: `💬 Follow-Up: How did "${title}" go?`,
    html,
    text: `Hope the meeting went well! We'd love to continue the conversation. If you'd like to schedule another meeting, simply reply to this email. Best regards, The ThinkAIWorks Team.${meetingLink ? ` Join link: ${meetingLink}` : ''}`,
  });
};

const sendOtpEmail = async ({ to, otp, name }) => {
  const logoPath = path.join(__dirname, '../../../frontend/public/img/logo.jpeg');
  const imageData = fs.existsSync(logoPath) ? fs.readFileSync(logoPath).toString('base64') : '';
  const logoDataUri = imageData ? `data:image/jpeg;base64,${imageData}` : `${process.env.APP_URL || 'http://localhost:3000'}/img/logo.jpeg`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0c0e16;border-radius:16px;border:1px solid #242a40;">
      <div style="text-align:center;margin-bottom:28px;">
        <img src="${logoDataUri}" alt="ThinkAI Works" style="width:80px;height:80px;border-radius:16px;margin:0 auto 12px;display:block;object-fit:cover;" />
        <h1 style="margin:0;color:#eceef5;font-size:22px;">ThinkAI Works</h1>
        <p style="margin:8px 0 0;color:#8890b0;font-size:14px;">Verify your email address</p>
      </div>
      <div style="background:#141828;border:1px solid #242a40;border-radius:12px;padding:28px 24px;text-align:center;">
        <p style="margin:0 0 4px;color:#8890b0;font-size:13px;">Hello${name ? ` ${name}` : ''},</p>
        <p style="margin:0 0 20px;color:#8890b0;font-size:13px;">Your verification code is</p>
        <div style="background:#07080d;border:1px solid #2e3650;border-radius:12px;padding:16px 24px;margin:0 auto 20px;display:inline-block;letter-spacing:12px;font-family:monospace;font-size:36px;font-weight:700;color:#00e5c8;">
          ${otp}
        </div>
        <p style="margin:0;color:#4a5070;font-size:12px;">This code expires in <span style="color:#f5c842;font-weight:600;">60 seconds</span>.</p>
      </div>
      <div style="background:rgba(255,79,109,0.08);border:1px solid rgba(255,79,109,0.2);border-radius:10px;padding:14px 18px;margin-top:20px;">
        <p style="margin:0;color:#ff4f6d;font-size:11px;">
          If you didn't request this email, please ignore it. Do not share this code with anyone.
        </p>
      </div>
      <p style="margin:20px 0 0;color:#4a5070;font-size:11px;text-align:center;">
        &copy; ${new Date().getFullYear()} ThinkAI Works. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail({
    to,
    subject: 'Verify Your Email Address',
    html,
    text: `Your verification code is ${otp}. This code expires in 60 seconds. If you didn't request this, please ignore this email.`,
  });
};

const sendMeetingCancelled = async ({ title, datetime, attendees, type, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink }) => {
  const allRecipients = getRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails });
  if (allRecipients.length === 0) return;

  const allEmails = [
    ...(Array.isArray(clientEmails) ? clientEmails : []),
    ...(Array.isArray(attendeeEmails) ? attendeeEmails : []),
  ];
  const attendeesStr = allEmails.length > 0 ? allEmails.join(', ') : (attendees || '');

  const timeStr = datetime
    ? new Date(datetime).toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : 'TBD';

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:580px;margin:0 auto;background:#0b0d17;border-radius:16px;border:1px solid #1e2340;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#141828 0%,#0b0d17 100%);padding:32px 36px 20px;text-align:center;border-bottom:1px solid #1e2340;">
        <h1 style="margin:0;color:#eceef5;font-size:22px;font-weight:700;letter-spacing:-0.3px;">ThinkAIWorks</h1>
        <p style="margin:4px 0 0;color:#5a6090;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Meeting Cancellation</p>
      </div>
      <div style="padding:28px 36px;">
        <div style="background:#141828;border:1px solid #1e2340;border-radius:14px;padding:24px;text-align:center;">
          <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,79,109,0.12);border:2px solid rgba(255,79,109,0.25);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <span style="font-size:28px;">✕</span>
          </div>
          <h2 style="margin:0 0 8px;color:#eceef5;font-size:20px;font-weight:700;">Meeting Cancelled</h2>
          <p style="margin:0 0 20px;color:#8890b0;font-size:14px;">This meeting has been cancelled by an admin.</p>

          <div style="background:rgba(255,79,109,0.06);border:1px solid rgba(255,79,109,0.15);border-radius:10px;padding:16px;text-align:left;">
            <p style="margin:0 0 12px;color:#eceef5;font-size:15px;font-weight:600;">${title}</p>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:5px 0;width:24px;vertical-align:top;color:#ff4f6d;font-size:13px;">📅</td>
                <td style="padding:5px 0;color:#8890b0;font-size:13px;vertical-align:top;"><span style="color:#eceef5;">${timeStr}</span></td>
              </tr>
              ${creatorEmail ? `
              <tr>
                <td style="padding:5px 0;width:24px;vertical-align:top;color:#ff4f6d;font-size:13px;">👤</td>
                <td style="padding:5px 0;color:#8890b0;font-size:13px;vertical-align:top;">Organized by <span style="color:#eceef5;">${creatorEmail}</span></td>
              </tr>` : ''}
              ${attendeesStr ? `
              <tr>
                <td style="padding:5px 0;width:24px;vertical-align:top;color:#ff4f6d;font-size:13px;">👥</td>
                <td style="padding:5px 0;color:#8890b0;font-size:13px;vertical-align:top;">Attendees: <span style="color:#eceef5;">${attendeesStr}</span></td>
              </tr>` : ''}
            </table>
          </div>
        </div>
        <div style="background:rgba(255,79,109,0.06);border:1px solid rgba(255,79,109,0.15);border-radius:10px;padding:14px 18px;margin-top:20px;text-align:center;">
          <p style="margin:0;color:#ff4f6d;font-size:12px;">If you have any questions, please reach out to your admin.</p>
        </div>
      </div>
      <div style="background:#141828;padding:18px 36px;text-align:center;border-top:1px solid #1e2340;">
        <p style="margin:0;color:#4a5070;font-size:11px;">Sent from ThinkAIWorks Command Hub &middot; Automated meeting notification</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: allRecipients,
    subject: `✕ Cancelled: "${title}"`,
    html,
    text: `Meeting "${title}" scheduled for ${timeStr} has been cancelled by an admin.${attendeesStr ? ` Attendees: ${attendeesStr}` : ''}`,
  });
};

module.exports = { sendEmail, sendMeetingReminder, sendMeetingCreated, sendMeetingFollowUp, sendMeetingFollowUp2h, sendMeetingCancelled, sendOtpEmail };
