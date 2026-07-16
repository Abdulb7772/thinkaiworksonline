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

module.exports = { sendEmail };
