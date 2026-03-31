const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  dailyMessages: { type: Number, default: 0 },
  weeklyMessages: { type: Number, default: 0 },
  monthlyMessages: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

async function addXP(userId, xp) {
  let user = await User.findOne({ userId });
  if (!user) user = new User({ userId });
  user.xp += xp;
  await user.save();
  return user;
}

async function getUser(userId) {
  const user = await User.findOne({ userId });
  return user || { xp: 0, level: 0 };
}

async function getAllUsers() {
  return await User.find().sort({ xp: -1 });
}

async function addMessageCount(userId) {
  let user = await User.findOne({ userId });
  if (!user) user = new User({ userId });
  user.dailyMessages++;
  user.weeklyMessages++;
  user.monthlyMessages++;
  await user.save();
}

async function getMessageCounts(type) {
  const users = await User.find().sort({ [`${type}Messages`]: -1 });
  return users.map(u => ({ id: u.userId, count: u[`${type}Messages`] }));
}

async function resetMessageCounts(type) {
  await User.updateMany({}, { [`${type}Messages`]: 0 });
}

async function getTopTexter() {
  const user = await User.findOne().sort({ dailyMessages: -1 });
  return user ? user.userId : null;
}

function checkLevel(xp) {
  if (xp >= 50000) return 5;
  if (xp >= 20000) return 4;
  if (xp >= 10000) return 3;
  if (xp >= 5000) return 2;
  if (xp >= 2000) return 1;
  return 0;
}

function xpForLevel(level) {
  const thresholds = { 1: 2000, 2: 5000, 3: 10000, 4: 20000, 5: 50000 };
  return thresholds[level] || null;
}

module.exports = {
  addXP, getUser, getAllUsers,
  addMessageCount, getMessageCounts, resetMessageCounts,
  getTopTexter, checkLevel, xpForLevel
};