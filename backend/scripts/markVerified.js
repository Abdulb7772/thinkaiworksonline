const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const User = require('../src/models/User');

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI not found in .env');
    process.exit(1);
  }
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
  const emails = ['admin@thinkalworks.online', 'demo@thinkalworks.online'];
  const res = await User.updateMany({ email: { $in: emails } }, { $set: { emailVerified: true } });
  console.log('Updated:', res.modifiedCount || res.nModified || res.n);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
