const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');
const { isDBConnected } = require('../config/db');

const router = express.Router();

const createTransporter = async () => {
  const transporter = process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : await (async () => {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      })();

  await transporter.verify();
  return transporter;
};

const sendEmployeeEmail = async ({ recipients, loginEmail, name, password }) => {
  const appUrl = 'https://www.thinkaiworks.online/';
  const transporter = await createTransporter();
  const uniqueRecipients = Array.from(new Set(recipients.map((email) => email.trim().toLowerCase()).filter(Boolean)));

  const mailOptions = {
    from: process.env.SMTP_FROM || `ThinkAIWorks <${process.env.SMTP_USER || 'noreply@thinkaiworks.online'}>`,
    replyTo: process.env.SMTP_REPLY_TO || process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@thinkaiworks.online',
    sender: process.env.SMTP_FROM || `ThinkAIWorks <${process.env.SMTP_USER || 'noreply@thinkaiworks.online'}>`,
    to: uniqueRecipients,
    subject: 'Your ThinkAIWorks access details',
    headers: {
      'X-Priority': '3 (Normal)',
      Importance: 'Normal',
      'List-Unsubscribe': `<mailto:unsubscribe@thinkaiworks.online?subject=Unsubscribe>`,
    },
    list: {
      unsubscribe: 'mailto:unsubscribe@thinkaiworks.online?subject=Unsubscribe',
    },
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f4f7fb;border-radius:14px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="margin:0;color:#111;">ThinkAIWorks</h1>
          <p style="margin:8px 0 0;color:#555;">New employee account created successfully</p>
        </div>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your employee account is ready. Use the details below to sign in to the Command Hub:</p>
        <div style="background:#ffffff;padding:18px;border-radius:12px;border:1px solid #e2e8f0;margin:20px 0;">
          <p style="margin:0 0 8px;"><strong>Login Email:</strong> ${loginEmail}</p>
          <p style="margin:0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p style="margin-bottom:24px;">Open the platform here:</p>
        <a href="${appUrl}" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#7c5cfc;color:#fff;text-decoration:none;font-weight:600;">Visit ThinkAIWorks</a>
        <p style="margin-top:24px;color:#6b7280;font-size:13px;">If you didn’t expect this, contact your administrator.</p>
      </div>
    `,
    text: `Your ThinkAIWorks account has been created. Login Email: ${loginEmail}\nPassword: ${password}\nOpen: ${appUrl}`,
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log('Test email preview URL:', previewUrl);
  return { info, previewUrl };
};

router.post('/', protect, async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create employee accounts' });
    }

    const { name, loginEmail, sendEmailTo, password, subRole } = req.body;
    const recipient = (sendEmailTo || loginEmail || '').trim();

    if (!name || !loginEmail || !password || !recipient) {
      return res.status(400).json({ error: 'Please provide name, login email, notification email, and password' });
    }

    const normalizedLoginEmail = loginEmail.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedLoginEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Login email already registered' });
    }

    const user = await User.create({ name, email: normalizedLoginEmail, password, role: 'employee' });

    await Employee.create({ name, email: normalizedLoginEmail, role: 'Team', subRole: subRole || null });

    let previewUrl = null;
    let emailWarning = null;
    try {
      const result = await sendEmployeeEmail({ recipients: [recipient], loginEmail: normalizedLoginEmail, name, password });
      previewUrl = result.previewUrl || null;
    } catch (emailError) {
      emailWarning = emailError.message || 'Email failed to send';
      console.error('Employee email failed:', emailWarning);
    }

    const responsePayload = {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      notificationSentTo: recipient,
    };
    if (previewUrl) responsePayload.emailPreviewUrl = previewUrl;
    if (emailWarning) responsePayload.emailWarning = emailWarning;

    res.status(201).json(responsePayload);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Login email already registered' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(error);
  }
});

module.exports = router;
