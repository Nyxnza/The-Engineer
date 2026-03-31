const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
  userId: String,
  warns: [{ reason: String, date: Date }]
});

const Warn = mongoose.model('Warn', warnSchema);

async function addWarn(userId, reason) {
  let user = await Warn.findOne({ userId });
  if (!user) user = new Warn({ userId, warns: [] });
  user.warns.push({ reason, date: new Date() });
  await user.save();
}

async function getWarns(userId) {
  const user = await Warn.findOne({ userId });
  return user ? user.warns : [];
}

async function removeWarn(userId, index) {
  const user = await Warn.findOne({ userId });
  if (!user || !user.warns[index]) return false;
  user.warns.splice(index, 1);
  await user.save();
  return true;
}

module.exports = { addWarn, getWarns, removeWarn };