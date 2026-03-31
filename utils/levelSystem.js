const fs = require('fs');
const path = './data/levels.json';
const dailyPath = './data/daily.json';
const weeklyPath = './data/weekly.json';
const monthlyPath = './data/monthly.json';

function load(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath));
}

function save(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function addXP(userId, xp) {
  const data = load(path);
  if (!data[userId]) data[userId] = { xp: 0, level: 0 };
  data[userId].xp += xp;
  save(path, data);
  return data[userId];
}

function getUser(userId) {
  const data = load(path);
  return data[userId] || { xp: 0, level: 0 };
}

function getAllUsers() {
  return load(path);
}

function addMessageCount(userId, filePath) {
  const data = load(filePath);
  if (!data[userId]) data[userId] = 0;
  data[userId]++;
  save(filePath, data);
}

function getMessageCounts(filePath) {
  return load(filePath);
}

function resetMessageCounts(filePath) {
  save(filePath, {});
}

function xpForLevel(level) {
  const thresholds = { 1: 2000, 2: 5000, 3: 10000, 4: 20000, 5: 50000 };
  return thresholds[level] || null;
}

function checkLevel(xp) {
  if (xp >= 50000) return 5;
  if (xp >= 20000) return 4;
  if (xp >= 10000) return 3;
  if (xp >= 5000) return 2;
  if (xp >= 2000) return 1;
  return 0;
}

module.exports = {
  addXP, getUser, getAllUsers,
  addMessageCount, getMessageCounts, resetMessageCounts,
  checkLevel, xpForLevel, load, save,
  paths: { daily: dailyPath, weekly: weeklyPath, monthly: monthlyPath, alltime: path }
};