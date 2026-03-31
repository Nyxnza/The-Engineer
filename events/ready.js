const db = require('../utils/levelSystem');
const TOP_TEXTER_ROLE = '#1 Texter of The Day';

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    // Start daily reset timer
    setInterval(async () => {
      for (const guild of client.guilds.cache.values()) {
        try {
          const dailyCounts = db.getMessageCounts(db.paths.daily);
          const sorted = Object.entries(dailyCounts).sort((a, b) => b[1] - a[1]);

          if (sorted.length === 0) continue;

          const topUserId = sorted[0][0];
          const topRole = guild.roles.cache.find(r => r.name === TOP_TEXTER_ROLE);
          if (!topRole) continue;

          const currentHolders = guild.members.cache.filter(m => m.roles.cache.has(topRole.id));
          for (const member of currentHolders.values()) {
            await member.roles.remove(topRole);
          }

          const topMember = guild.members.cache.get(topUserId);
          if (topMember) {
            await topMember.roles.add(topRole);
            console.log(`[DAILY RESET] #1 Texter: ${topMember.user.tag}`);
          }

          db.resetMessageCounts(db.paths.daily);
          if (new Date().getDay() === 0) db.resetMessageCounts(db.paths.weekly);
          if (new Date().getDate() === 1) db.resetMessageCounts(db.paths.monthly);

        } catch (err) {
          console.error('[DAILY RESET ERROR]', err);
        }
      }
    }, 24 * 60 * 60 * 1000);
  }
};