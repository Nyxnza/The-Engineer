const db = require('../utils/levelSystem');
const TOP_TEXTER_ROLE = '#1 Texter of The Day';

function getMsUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
}

async function runDailyReset(client) {
  for (const guild of client.guilds.cache.values()) {
    try {
      const dailyCounts = db.getMessageCounts(db.paths.daily);
      const sorted = Object.entries(dailyCounts).sort((a, b) => b[1] - a[1]);

      if (sorted.length > 0) {
        const topUserId = sorted[0][0];
        const topRole = guild.roles.cache.find(r => r.name === TOP_TEXTER_ROLE);

        if (topRole) {
          // Remove role from everyone who has it
          const currentHolders = guild.members.cache.filter(m => m.roles.cache.has(topRole.id));
          for (const member of currentHolders.values()) {
            await member.roles.remove(topRole);
          }

          // Give role to new top texter
          const topMember = guild.members.cache.get(topUserId);
          if (topMember) {
            await topMember.roles.add(topRole);
            console.log(`[DAILY RESET] #1 Texter: ${topMember.user.tag}`);
          }
        }
      }

      // Always reset daily
      db.resetMessageCounts(db.paths.daily);
      console.log('[RESET] Daily leaderboard reset.');

      // Reset weekly on Sunday (day 0)
      if (new Date().getDay() === 0) {
        db.resetMessageCounts(db.paths.weekly);
        console.log('[RESET] Weekly leaderboard reset.');
      }

      // Reset monthly on 1st
      if (new Date().getDate() === 1) {
        db.resetMessageCounts(db.paths.monthly);
        console.log('[RESET] Monthly leaderboard reset.');
      }

    } catch (err) {
      console.error('[DAILY RESET ERROR]', err);
    }
  }
}

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    // Wait until next midnight then run every 24 hours
    const msUntilMidnight = getMsUntilMidnight();
    console.log(`[RESET] Next reset in ${Math.round(msUntilMidnight / 1000 / 60)} minutes.`);

    setTimeout(() => {
      runDailyReset(client);

      // Then repeat every 24 hours exactly
      setInterval(() => runDailyReset(client), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }
};