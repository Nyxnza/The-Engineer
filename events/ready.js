const db = require('../utils/levelSystem');
const TOP_TEXTER_ROLE = '#1 Texter of The Day';
const MEMBER_COUNT_CHANNEL_ID = '1488126508529877133';

function getMsUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
}

async function updateMemberCount(client) {
  for (const guild of client.guilds.cache.values()) {
    try {
      const channel = guild.channels.cache.get(MEMBER_COUNT_CHANNEL_ID);
      if (!channel) continue;
      const count = guild.memberCount;
      await channel.setName(`all-members-${count}`);
    } catch (err) {
      console.error('[MEMBER COUNT ERROR]', err);
    }
  }
}

async function runDailyReset(client) {
  for (const guild of client.guilds.cache.values()) {
    try {
      const topUserId = await db.getTopTexter();

      if (topUserId) {
        const topRole = guild.roles.cache.find(r => r.name === TOP_TEXTER_ROLE);
        if (topRole) {
          const currentHolders = guild.members.cache.filter(m => m.roles.cache.has(topRole.id));
          for (const member of currentHolders.values()) {
            await member.roles.remove(topRole);
          }
          const topMember = guild.members.cache.get(topUserId);
          if (topMember) {
            await topMember.roles.add(topRole);
            console.log(`[DAILY RESET] #1 Texter: ${topMember.user.tag}`);
          }
        }
      }

      await db.resetMessageCounts('daily');
      console.log('[RESET] Daily leaderboard reset.');

      if (new Date().getDay() === 0) {
        await db.resetMessageCounts('weekly');
        console.log('[RESET] Weekly leaderboard reset.');
      }

      if (new Date().getDate() === 1) {
        await db.resetMessageCounts('monthly');
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
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    // Update member count immediately on startup
    await updateMemberCount(client);

    // Update member count every 10 minutes
    setInterval(() => updateMemberCount(client), 10 * 60 * 1000);

    // Daily reset timer
    const msUntilMidnight = getMsUntilMidnight();
    console.log(`[RESET] Next reset in ${Math.round(msUntilMidnight / 1000 / 60)} minutes.`);

    setTimeout(() => {
      runDailyReset(client);
      setInterval(() => runDailyReset(client), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }
};