const fs = require('fs');
const path = './data/warns.json';

function load() {
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path));
}

function save(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function addWarn(userId, reason) {
  const data = load();

  if (!data[userId]) data[userId] = [];

  data[userId].push({ reason, date: new Date() });

  save(data);
}

function getWarns(userId) {
  const data = load();
  return data[userId] || [];
}

module.exports = { addWarn, getWarns };

function removeWarn(userId, index) {
  const data = load();

  if (!data[userId]) return false;
  if (!data[userId][index]) return false;

  data[userId].splice(index, 1);
  save(data);

  return true;
}

module.exports = { addWarn, getWarns, removeWarn };