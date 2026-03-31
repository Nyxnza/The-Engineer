const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/levelSystem');

const VALID_TYPES = ['daily', 'weekly', 'monthly', 'alltime'];

async function buildLeaderboard(type, guild) {
  let data;
  let title;

  if (type === 'alltime') {
    const raw = db.getAllUsers();
    data = Object.entries(raw)
      .map(([id, d]) => ({ id, count: d.xp }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    title = '🏆 All Time XP Leaderboard';
  } else {
    const pathMap = {
      daily: db.paths.daily,
      weekly: db.paths.weekly,
      monthly: db.paths.monthly
    };
    const raw = db.getMessageCounts(pathMap[type]);
    data = Object.entries(raw)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    title = {
      daily: '📅 Daily Message Leaderboard',
      weekly: '📆 Weekly Message Leaderboard',
      monthly: '🗓️ Monthly Message Leaderboard'
    }[type];
  }

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor('Gold')
    .setTimestamp();

  if (data.length === 0) {
    embed.setDescription('No data yet!');
    return embed;
  }

  const medals = ['🥇', '🥈', '🥉'];
  const lines = await Promise.all(data.map(async (entry, i) => {
    let name = `<@${entry.id}>`;
    try {
      const member = guild.members.cache.get(entry.id);
      if (member) name = member.displayName;
    } catch {}
    const medal = medals[i] || `**#${i + 1}**`;
    const label = type === 'alltime' ? `${entry.count} XP` : `${entry.count} messages`;
    return `${medal} ${name} — ${label}`;
  }));

  embed.setDescription(lines.join('\n'));
  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the leaderboard')
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Which leaderboard to show')
        .setRequired(false)
        .addChoices(
          { name: 'Daily', value: 'daily' },
          { name: 'Weekly', value: 'weekly' },
          { name: 'Monthly', value: 'monthly' },
          { name: 'All Time', value: 'alltime' }
        )
    ),

  async execute(interaction) {
    const type = interaction.options.getString('type') || 'alltime';
    const embed = await buildLeaderboard(type, interaction.guild);
    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message, args) {
    let type = (args[0] || 'alltime').toLowerCase();
    if (!VALID_TYPES.includes(type)) {
      return message.reply('❌ Invalid type.\n📖 **Syntax:** `!lb [daily|weekly|monthly|alltime]`');
    }
    const embed = await buildLeaderboard(type, message.guild);
    await message.reply({ embeds: [embed] });
  }
};