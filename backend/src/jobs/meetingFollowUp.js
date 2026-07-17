const cron = require('node-cron');
const Meeting = require('../models/Meeting');
const { sendMeetingFollowUp2h } = require('../services/emailService');
const { isDBConnected } = require('../config/db');

const startMeetingFollowUpJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    if (!isDBConnected()) return;

    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const completed = await Meeting.find({
        completedAt: { $lte: twoHoursAgo, $ne: null },
        followUpSent2h: false,
      });

      for (const meeting of completed) {
        try {
          await sendMeetingFollowUp2h({
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

          meeting.followUpSent2h = true;
          await meeting.save();

          console.log(`✓ 2h follow-up sent for "${meeting.title}"`);
        } catch (err) {
          console.error(`✗ 2h follow-up failed for "${meeting.title}":`, err.message);
        }
      }
    } catch (err) {
      console.error('Meeting follow-up cron error:', err.message);
    }
  });

  console.log('✓ Meeting follow-up job started (runs every 5 minutes)');
};

module.exports = { startMeetingFollowUpJob };
