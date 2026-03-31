const PREFIX = '!';
const ALIASES = { 'h': 'help', 'lb': 'leaderboard' };
const db = require('../utils/levelSystem');

const LEVEL_ROLES = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
  4: 'Tier 4',
  5: 'Tier 5'
};

const cooldowns = new Set();

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message || message.author?.bot) return;
    if (!message.guild) return;

    const userId = message.author.id;

    // XP & leveling
    if (!cooldowns.has(userId)) {
      const xp = Math.floor(Math.random() * 11) + 10; // 10-20 XP
      const userData = db.addXP(userId, xp);
      const newLevel = db.checkLevel(userData.xp);

      if (newLevel > (userData.level || 0)) {
        // Update stored level
        const allData = db.load(db.paths.alltime);
        allData[userId].level = newLevel;
        db.save(db.paths.alltime, allData);

        // Assign role
        const member = message.guild.members.cache.get(userId);
        if (member) {
          const roleName = LEVEL_ROLES[newLevel];
          const role = message.guild.roles.cache.find(r => r.name === roleName);
          if (role && !member.roles.cache.has(role.id)) {
            await member.roles.add(role);
            await message.channel.send(`🎉 <@${userId}> leveled up to **${roleName}**!`);
          }
        }
      }

      // Message counts for leaderboard
      db.addMessageCount(userId, db.paths.daily);
      db.addMessageCount(userId, db.paths.weekly);
      db.addMessageCount(userId, db.paths.monthly);

      // XP cooldown (1 message per 10 seconds counts for XP)
      cooldowns.add(userId);
      setTimeout(() => cooldowns.delete(userId), 10000);
    } else {
      // Still count messages even during XP cooldown
      db.addMessageCount(userId, db.paths.daily);
      db.addMessageCount(userId, db.paths.weekly);
      db.addMessageCount(userId, db.paths.monthly);
    }

    // Prefix commands
    if (!message.content?.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    let commandName = args.shift().toLowerCase();

    if (ALIASES[commandName]) commandName = ALIASES[commandName];

    const command = client.commands.get(commandName);
    if (!command) return;
    if (!command.executePrefix) return;

    try {
      await command.executePrefix(message, args, client);
    } catch (err) {
      console.error(err);
      message.reply('There was an error executing that command.');
    }
  }
};