const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[DB] Connected to MongoDB!');
  } catch (err) {
    console.error('[DB] Connection failed:', err);
    process.exit(1);
  }
}

module.exports = { connect };