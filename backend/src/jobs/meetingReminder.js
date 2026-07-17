const cron = require('node-cron');
const Meeting = require('../models/Meeting');
const { sendMeetingReminder } = require('../services/emailService');
const { isDBConnected } = require('../config/db');

/**
 * Runs every minute.
 * Finds all meetings that:
 *   - have a datetime between now+9min and now+11min (the 10-minute window)
 *   - have not had a reminder sent yet (reminderSent: false)
 *   - have at least one email recipient (clientEmail or adminEmails)
 * Sends reminder emails and marks reminderSent: true.
 */
const startMeetingReminderJob = () => {
  cron.schedule('* * * * *', async () => {
    if (!isDBConnected()) return;

    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() + 9 * 60 * 1000);  // now + 9 min
      const windowEnd   = new Date(now.getTime() + 11 * 60 * 1000); // now + 11 min

      const upcoming = await Meeting.find({
        datetime:     { $gte: windowStart, $lte: windowEnd },
        reminderSent: false,
        $or: [
          { clientEmails: { $exists: true, $not: { $size: 0 } } },
          { creatorEmail: { $exists: true, $ne: '' } },
          { attendeeEmails: { $exists: true, $not: { $size: 0 } } },
          { adminEmails: { $exists: true, $not: { $size: 0 } } },
        ],
      });

      for (const meeting of upcoming) {
        try {
          await sendMeetingReminder({
            title:          meeting.title,
            datetime:       meeting.datetime,
            attendees:      meeting.attendees,
            type:           meeting.type,
            clientEmails:   meeting.clientEmails,
            creatorEmail:   meeting.creatorEmail,
            attendeeEmails: meeting.attendeeEmails,
            adminEmails:    meeting.adminEmails,
            meetingLink:    meeting.meetingLink,
          });

          meeting.reminderSent = true;
          await meeting.save();

          console.log(`✓ Meeting reminder sent for "${meeting.title}"`);
        } catch (err) {
          console.error(`✗ Failed to send reminder for "${meeting.title}":`, err.message);
        }
      }
    } catch (err) {
      console.error('Meeting reminder cron error:', err.message);
    }
  });

  console.log('✓ Meeting reminder job started (runs every minute)');
};

module.exports = { startMeetingReminderJob };
