const db = require('../utils/levelSystem');

const TOP_TEXTER_ROLE = '#1 Texter of The Day';

module.exports = {
  name: 'ready',
  once: false,
  execute(client) {
    // Run every 24 hours
    setInterval(async () => {
      for (const guild of client.guilds.cache.values()) {
        try {
          const dailyCounts = db.getMessageCounts(db.paths.daily);
          const sorted = Object.entries(dailyCounts).sort((a, b) => b[1] - a[1]);

          if (sorted.length === 0) continue;

          const topUserId = sorted[0][0];
          const topRole = guild.roles.cache.find(r => r.name === TOP_TEXTER_ROLE);
          if (!topRole) continue;

          // Remove role from everyone who has it
          const currentHolders = guild.members.cache.filter(m => m.roles.cache.has(topRole.id));
          for (const member of currentHolders.values()) {
            await member.roles.remove(topRole);
          }

          // Give role to new top texter
          const topMember = guild.members.cache.get(topUserId);
          if (topMember) {
            await topMember.roles.add(topRole);
            console.log(`[DAILY] #1 Texter of The Day: ${topMember.user.tag}`);
          }

          // Reset daily counts
          db.resetMessageCounts(db.paths.daily);

          // Reset weekly on Sunday (day 0)
          const day = new Date().getDay();
          if (day === 0) db.resetMessageCounts(db.paths.weekly);

          // Reset monthly on 1st
          const date = new Date().getDate();
          if (date === 1) db.resetMessageCounts(db.paths.monthly);

        } catch (err) {
          console.error('[DAILY RESET ERROR]', err);
        }
      }
    }, 24 * 60 * 60 * 1000); // every 24 hours
  }
};