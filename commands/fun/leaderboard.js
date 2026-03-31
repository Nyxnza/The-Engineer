const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/levelSystem');

const VALID_TYPES = ['daily', 'weekly', 'monthly', 'alltime'];

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
}

function getNextSunday() {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + daysUntilSunday);
  sunday.setHours(0, 0, 0, 0);
  const diff = sunday - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days}d ${hours}h ${minutes}m`;
}

function getNextMonth() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diff = nextMonth - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days}d ${hours}h ${minutes}m`;
}

function getResetTimer(type) {
  if (type === 'daily') return `⏰ Resets in: **${getNextMidnight()}**`;
  if (type === 'weekly') return `⏰ Resets in: **${getNextSunday()}**`;
  if (type === 'monthly') return `⏰ Resets in: **${getNextMonth()}**`;
  return null;
}

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

  // Add reset timer for daily/weekly/monthly
  const timer = getResetTimer(type);
  if (timer) embed.setFooter({ text: timer.replace('⏰ Resets in: **', '').replace('**', '') });

  if (data.length === 0) {
    embed.setDescription(timer ? `${timer}\n\nNo data yet!` : 'No data yet!');
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

  const description = timer ? `${timer}\n\n${lines.join('\n')}` : lines.join('\n');
  embed.setDescription(description);

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