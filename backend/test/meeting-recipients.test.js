const assert = require('assert');
const { collectRecipients } = require('../src/services/emailService');
const { normalizeParticipants, buildContacts } = require('../src/routes/meetings');

const test = async () => {
  // collectRecipients: every source treated the same, deduped, lowercased
  const recipients = collectRecipients({
    clientEmails: ['Client@ABC.com'],
    creatorEmail: 'boss@thinkaiworks.online',
    attendeeEmails: ['dev@gmail.com'],
    adminEmails: ['admin@thinkaiworks.online'],
    clients: [{ id: 'c1', name: 'ABC Corp', email: 'contact@abc.com' }, { id: null, name: '', email: 'outsideclient@gmail.com', external: true }],
    attendeeList: [{ id: 'e1', name: 'Muhammad Ali', email: 'muhammadali@thinkaiworks.online' }, { id: null, name: '', email: 'developer@gmail.com', external: true }],
  });

  assert.deepStrictEqual(recipients.sort(), [
    'admin@thinkaiworks.online',
    'boss@thinkaiworks.online',
    'client@abc.com',
    'contact@abc.com',
    'dev@gmail.com',
    'developer@gmail.com',
    'muhammadali@thinkaiworks.online',
    'outsideclient@gmail.com',
  ].sort(), 'all database + manual emails must be recipients');

  // dedupe across sources (same email in clients array and legacy list)
  const deduped = collectRecipients({
    clients: [{ id: 'c1', email: 'dup@x.com' }],
    attendeeList: [{ id: null, email: 'dup@x.com' }],
    clientEmails: ['DUP@x.com'],
    attendeeEmails: ['dup@x.com'],
  });
  assert.deepStrictEqual(deduped, ['dup@x.com'], 'duplicates across sources must collapse');

  // normalizeParticipants: trim, lowercase, dedupe, external flag, id/null
  const { clients, attendees } = normalizeParticipants(
    [
      { id: 'c1', name: ' ABC Corp ', email: '  Contact@ABC.com  ' },
      { id: 'c2', name: 'Dup', email: 'contact@abc.com' },
      { id: 'c3', name: '', email: 'manual@x.com', external: true },
      { id: 'c4', name: 'NoEmail', email: '' },
    ],
    [
      { id: 'e1', name: 'Muhammad Ali', email: 'muhammadali@thinkaiworks.online' },
      { id: null, name: '', email: 'outside@gmail.com', external: true },
      { id: null, name: '', email: 'OUTSIDE@gmail.com', external: true },
    ]
  );

  assert.strictEqual(clients.length, 2, 'dup + empty emails removed');
  assert.deepStrictEqual(clients[0], { id: 'c1', name: 'ABC Corp', email: 'contact@abc.com', external: false });
  assert.deepStrictEqual(clients[1], { id: 'c3', name: '', email: 'manual@x.com', external: true });
  assert.strictEqual(attendees.length, 2);
  assert.deepStrictEqual(attendees[1], { id: null, name: '', email: 'outside@gmail.com', external: true });

  // buildContacts: primary email only, no duplicates, clients fall back to customer users
  const contacts = buildContacts(
    [
      { _id: 'e1', name: 'Muhammad Ali', email: 'muhammadali@thinkaiworks.online', loginEmail: 'mali@secondary.com' },
      { _id: 'e2', name: 'Ahmed Khan', email: '', loginEmail: 'ahmed@gmail.com' },
      { _id: 'e3', name: 'Dup', email: 'muhammadali@thinkaiworks.online', loginEmail: '' },
    ],
    [
      { _id: 'u1', name: 'Muhammad Ali', email: 'mali@secondary.com' },
      { _id: 'u2', name: 'Only User', email: 'onlyuser@thinkaiworks.online' },
    ],
    [
      { _id: 'c1', name: 'ABC Corp', email: 'contact@abc.com' },
      { _id: 'c2', name: 'No Email Client', email: '' },
      { _id: 'c3', name: 'Dup Client', email: 'contact@abc.com' },
    ],
    [
      { _id: 'u3', name: 'Customer One', email: 'customer@xyz.com' },
      { _id: 'u4', name: 'ABC Corp', email: 'CONTACT@abc.com' },
    ]
  );

  assert.deepStrictEqual(contacts.employees, [
    { id: 'e1', name: 'Muhammad Ali', email: 'muhammadali@thinkaiworks.online' },
    { id: 'e2', name: 'Ahmed Khan', email: 'ahmed@gmail.com' },
    { id: 'u2', name: 'Only User', email: 'onlyuser@thinkaiworks.online' },
  ], 'employees listed once by primary email only');

  assert.deepStrictEqual(contacts.clients, [
    { id: 'c1', name: 'ABC Corp', email: 'contact@abc.com' },
    { id: 'u3', name: 'Customer One', email: 'customer@xyz.com' },
  ], 'clients with emails deduped, empty-email clients skipped, customer users merged');

  console.log('PASS: recipients collect all sources, dedupe, trim, lowercase');
};

test().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
