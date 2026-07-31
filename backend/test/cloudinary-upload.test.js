const assert = require('assert');
const { PassThrough } = require('stream');
const cloudinary = require('cloudinary').v2;
const { uploadBuffer } = require('../src/utils/cloudinary');

async function test() {
  let opts;
  cloudinary.uploader.upload_stream = (options, cb) => {
    opts = options;
    const ps = new PassThrough();
    ps.on('data', () => {});
    ps.on('end', () => cb(null, {
      secure_url: 'https://res.cloudinary.com/x/upload/v1/thinkaiworks/Week_1_test.pdf',
      public_id: 'thinkaiworks/Week_1_test.pdf',
      resource_type: 'raw',
      format: 'pdf',
      bytes: 10,
      original_filename: 'Week 1 test.pdf',
    }));
    return ps;
  };

  const r = await uploadBuffer(Buffer.from('x'.repeat(10)), 'Week 1 test.pdf', 'application/pdf');

  assert.strictEqual(opts.use_filename, true, 'use_filename must be true');
  assert.strictEqual(opts.unique_filename, true, 'unique_filename must be true');
  assert.strictEqual(opts.resource_type, 'auto', 'resource_type must be auto');
  assert.strictEqual(opts.filename, 'Week 1 test.pdf', 'original name passed through untouched');
  assert.ok(!opts.public_id, 'no manual public_id constructed');
  assert.ok(r.url.includes('/fl_inline/'), 'raw pdf gets fl_inline');
  assert.ok(r.url.endsWith('Week_1_test.pdf'), 'public filename keeps .pdf extension');
  assert.strictEqual(r.format, 'pdf');
  assert.strictEqual(r.original_filename, 'Week 1 test.pdf');

  console.log('PASS: original name preserved, extension intact, Cloudinary derives Week_1_test.pdf');
}

test().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
