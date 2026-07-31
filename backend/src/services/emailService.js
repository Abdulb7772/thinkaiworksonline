const { Resend } = require('resend');

let resendInstance = null;

const getResend = () => {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set — add it to your Render environment variables (or .env for local dev). Get a key at https://resend.com');
      return null;
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
};

const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const resend = getResend();
  if (!resend) {
    console.log(`📧 Would send email to ${Array.isArray(to) ? to.join(', ') : to} — subject: "${subject}" (no RESEND_API_KEY configured)`);
    return { id: 'mock' };
  }
  const from = process.env.EMAIL_FROM || '"ThinkAIWorks" <noreply@thinkaiworks.online>';
  const recipients = Array.isArray(to) ? to : [to];
  const recipientStr = recipients.join(', ');

  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    html,
    text,
    reply_to: replyTo,
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
        <img src="https://www.thinkaiworks.online/img/logo.jpeg" alt="ThinkAI Works" style="width:80px;height:80px;border-radius:16px;margin:0 auto 12px;display:block;object-fit:cover;" />
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

const normalizeEmail = (e) => String(e || '').trim().toLowerCase();

const collectRecipients = ({ clientEmails, creatorEmail, attendeeEmails, adminEmails, clients, attendeeList }) => {
  const set = new Set();
  const add = (e) => { const n = normalizeEmail(e); if (n) set.add(n); };
  (Array.isArray(clients) ? clients : []).forEach(c => add(c && c.email));
  (Array.isArray(attendeeList) ? attendeeList : []).forEach(a => add(a && a.email));
  (Array.isArray(clientEmails) ? clientEmails : []).forEach(add);
  add(creatorEmail);
  (Array.isArray(attendeeEmails) ? attendeeEmails : []).forEach(add);
  (Array.isArray(adminEmails) ? adminEmails : []).forEach(add);
  return [...set];
};

const sendMeetingReminder = async ({ title, datetime, attendees, type, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink, clients, attendeeList }) => {
  const allRecipients = collectRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails, clients, attendeeList });
  if (allRecipients.length === 0) return;

  const allEmails = [
    ...(Array.isArray(clientEmails) ? clientEmails : []),
    ...(Array.isArray(attendeeEmails) ? attendeeEmails : []),
    ...(Array.isArray(clients) ? clients.map(c => c.email) : []),
    ...(Array.isArray(attendeeList) ? attendeeList.map(a => a.email) : []),
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

const sendMeetingCreated = async ({ title, datetime, attendees, type, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink, clients, attendeeList }) => {
  const allRecipients = collectRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails, clients, attendeeList });
  if (allRecipients.length === 0) return;

  const allEmails = [
    ...(Array.isArray(clientEmails) ? clientEmails : []),
    ...(Array.isArray(attendeeEmails) ? attendeeEmails : []),
    ...(Array.isArray(clients) ? clients.map(c => c.email) : []),
    ...(Array.isArray(attendeeList) ? attendeeList.map(a => a.email) : []),
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

const sendMeetingFollowUp = async ({ title, datetime, attendees, type, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink, clients, attendeeList }) => {
  const allRecipients = collectRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails, clients, attendeeList });
  if (allRecipients.length === 0) return;

  const allEmails = [
    ...(Array.isArray(clientEmails) ? clientEmails : []),
    ...(Array.isArray(attendeeEmails) ? attendeeEmails : []),
    ...(Array.isArray(clients) ? clients.map(c => c.email) : []),
    ...(Array.isArray(attendeeList) ? attendeeList.map(a => a.email) : []),
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
        <img src="https://www.thinkaiworks.online/img/logo.jpeg" alt="ThinkAI Works" style="width:80px;height:80px;border-radius:16px;margin:0 auto 12px;display:block;object-fit:cover;" />
        <h1 style="margin:0;color:#eceef5;font-size:22px;font-weight:700;letter-spacing:-0.3px;">ThinkAIWorks</h1>
        <p style="margin:4px 0 0;color:#5a6090;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Meeting Follow-Up</p>
      </div>
      <div style="padding:28px 36px;text-align:center;">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(52,211,153,0.1);border:2px solid rgba(52,211,153,0.2);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:28px;">🙏</span>
        </div>
        <h2 style="margin:0 0 6px;color:#eceef5;font-size:22px;font-weight:700;">Thank You</h2>
        <p style="margin:0 0 24px;color:#8890b0;font-size:14px;">We hope the meeting was productive and valuable for you.</p>

        <div style="background:#141828;border:1px solid #1e2340;border-radius:12px;padding:20px;text-align:left;margin-bottom:24px;">
          <p style="margin:0 0 16px;color:#eceef5;font-size:16px;font-weight:600;text-align:center;">${title}</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;width:24px;vertical-align:top;font-size:14px;">📅</td>
              <td style="padding:6px 0;color:#8890b0;font-size:13px;vertical-align:top;"><span style="color:#eceef5;">${timeStr}</span></td>
            </tr>
            ${creatorEmail ? `
            <tr>
              <td style="padding:6px 0;width:24px;vertical-align:top;font-size:14px;">👤</td>
              <td style="padding:6px 0;color:#8890b0;font-size:13px;vertical-align:top;">Organized by <span style="color:#eceef5;">${creatorEmail}</span></td>
            </tr>` : ''}
            ${attendeesStr ? `
            <tr>
              <td style="padding:6px 0;width:24px;vertical-align:top;font-size:14px;">👥</td>
              <td style="padding:6px 0;color:#8890b0;font-size:13px;vertical-align:top;">Attendees: <span style="color:#eceef5;">${attendeesStr}</span></td>
            </tr>` : ''}
          </table>
        </div>

        <a href="https://www.thinkaiworks.online/" style="display:inline-block;padding:14px 36px;background:#7c5cfc;color:#ffffff;text-decoration:none;border-radius:12px;font-size:16px;font-weight:700;letter-spacing:0.3px;">Visit ThinkAIWorks →</a>
        <p style="margin:10px 0 0;color:#5a6090;font-size:12px;">Explore more tools and features</p>

        <div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.15);border-radius:10px;padding:14px 18px;margin-top:24px;">
          <p style="margin:0;color:#34d399;font-size:12px;">Best regards,<br/>The ThinkAIWorks Team</p>
        </div>
      </div>
      <div style="background:#141828;padding:18px 36px;text-align:center;border-top:1px solid #1e2340;">
        <p style="margin:0;color:#4a5070;font-size:11px;">Sent from ThinkAIWorks Command Hub &middot; Automated meeting notification</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: allRecipients,
    subject: `📋 Meeting Follow-Up: "${title}"`,
    html,
    text: `Thank you for attending "${title}" on ${timeStr}.${meetingLink ? ` Rejoin: ${meetingLink}` : ''} — Best regards, The ThinkAIWorks Team`,
  });
};

const sendMeetingFollowUp2h = async ({ title, datetime, attendees, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink, clients, attendeeList }) => {
  const allRecipients = collectRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails, clients, attendeeList });
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
  const logoUrl = 'https://www.thinkaiworks.online/img/logo.jpeg';
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#0c0e16;border-radius:16px;border:1px solid #242a40;">
      <div style="text-align:center;margin-bottom:28px;">
        <img src="${logoUrl}" alt="ThinkAI Works" style="width:80px;height:80px;border-radius:16px;margin:0 auto 12px;display:block;object-fit:cover;" />
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

const sendMeetingCancelled = async ({ title, datetime, attendees, type, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink, clients, attendeeList }) => {
  const allRecipients = collectRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails, clients, attendeeList });
  if (allRecipients.length === 0) return;

  const allEmails = [
    ...(Array.isArray(clientEmails) ? clientEmails : []),
    ...(Array.isArray(attendeeEmails) ? attendeeEmails : []),
    ...(Array.isArray(clients) ? clients.map(c => c.email) : []),
    ...(Array.isArray(attendeeList) ? attendeeList.map(a => a.email) : []),
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
        <img src="https://www.thinkaiworks.online/img/logo.jpeg" alt="Think AI Works" style="width:80px;height:80px;border-radius:16px;margin:0 auto 12px;display:block;object-fit:cover;" />
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

const taskUpdateHtml = ({ heading, lines }) => `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="padding:24px 28px 12px;border-bottom:1px solid #e5e7eb;">
      <span style="font-weight:700;font-size:17px;color:#111827;">ThinkAIWorks</span>
    </div>
    <div style="padding:24px 28px;">
      <h1 style="margin:0 0 4px;color:#111827;font-size:18px;font-weight:700;">${heading}</h1>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 18px;margin:16px 0;">
        ${lines.map(l => `<p style="margin:0 0 6px;color:#374151;font-size:14px;line-height:1.5;">${l}</p>`).join('')}
      </div>
      <a href="https://www.thinkaiworks.online/" style="display:inline-block;padding:10px 22px;background:#7c5cfc;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">View in Dashboard</a>
    </div>
    <div style="padding:14px 28px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;line-height:1.6;">
      <p style="margin:0;">You are receiving this email because you are a member of the ThinkAIWorks workspace. To stop receiving these updates, contact your administrator.</p>
      <p style="margin:6px 0 0;">ThinkAIWorks &middot; thinkaiworks.online</p>
    </div>
  </div>
`;

const taskUpdateText = ({ heading, lines, url = 'https://www.thinkaiworks.online/' }) => [
  heading,
  ...lines.map(l => l.replace(/<[^>]+>/g, '')),
  '',
  `View it in the dashboard: ${url}`,
  '',
  'You are receiving this email because you are a member of the ThinkAIWorks workspace.',
  'To stop receiving these updates, contact your administrator.',
].join('\n');

const sendMeetingUpdated = async ({ title, datetime, attendees, type, clientEmails, creatorEmail, attendeeEmails, adminEmails, meetingLink, clients, attendeeList }) => {
  const allRecipients = collectRecipients({ clientEmails, creatorEmail, attendeeEmails, adminEmails, clients, attendeeList });
  if (allRecipients.length === 0) return;

  const allEmails = [
    ...(Array.isArray(clientEmails) ? clientEmails : []),
    ...(Array.isArray(attendeeEmails) ? attendeeEmails : []),
    ...(Array.isArray(clients) ? clients.map(c => c.email) : []),
    ...(Array.isArray(attendeeList) ? attendeeList.map(a => a.email) : []),
  ];
  const attendeesStr = allEmails.length > 0 ? allEmails.join(', ') : (attendees || '');

  const html = meetingHtml({
    title, datetime, attendees: attendeesStr, meetingLink, creatorEmail, type,
    bodyContent: '<div style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.2);border-radius:10px;padding:12px 18px;margin-top:20px;text-align:center;"><p style="margin:0;color:#4a9eff;font-size:13px;font-weight:600;">✏️ Meeting details have been updated — please review</p></div>',
  });

  await sendEmail({
    to: allRecipients,
    subject: `✏️ Updated: "${title}"`,
    html,
    text: `The meeting "${title}" has been updated for ${datetime ? new Date(datetime).toLocaleString() : 'TBD'}.${attendeesStr ? ` Attendees: ${attendeesStr}` : ''}${meetingLink ? ` Join: ${meetingLink}` : ''}`,
  });
};

module.exports = { sendEmail, sendMeetingReminder, sendMeetingCreated, sendMeetingFollowUp, sendMeetingFollowUp2h, sendMeetingCancelled, sendOtpEmail, sendMeetingUpdated, taskUpdateHtml, taskUpdateText, collectRecipients };
