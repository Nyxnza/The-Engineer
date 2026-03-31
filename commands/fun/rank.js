const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/levelSystem');

const LEVEL_THRESHOLDS = [
  { level: 5, xp: 50000 },
  { level: 4, xp: 20000 },
  { level: 3, xp: 10000 },
  { level: 2, xp: 5000 },
  { level: 1, xp: 2000 },
];

function getNextThreshold(xp) {
  for (const t of LEVEL_THRESHOLDS) {
    if (xp < t.xp) continue;
    const idx = LEVEL_THRESHOLDS.indexOf(t);
    if (idx === 0) return { next: t.xp, label: `Tier ${t.level} (MAX)` };
    const next = LEVEL_THRESHOLDS[idx - 1];
    return { next: next.xp, label: `Tier ${next.level}` };
  }
  return { next: 2000, label: 'Tier 1' };
}

function buildRankEmbed(user, userData) {
  const currentLevel = db.checkLevel(userData.xp);
  const { next, label } = getNextThreshold(userData.xp);
  const progress = Math.min(Math.floor((userData.xp / next) * 100), 100);
  const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

  return new EmbedBuilder()
    .setTitle(`📊 Rank — ${user.username}`)
    .setColor('Blurple')
    .addFields(
      { name: 'Tier', value: currentLevel === 0 ? 'Unranked' : `Tier ${currentLevel}`, inline: true },
      { name: 'XP', value: `${userData.xp} XP`, inline: true },
      { name: 'Next Tier', value: label, inline: true },
      { name: 'Progress', value: `${bar} ${progress}%`, inline: false }
    )
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your rank or another user\'s rank')
    .addUserOption(opt => opt.setName('user').setDescription('User to check')),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const userData = await db.getUser(user.id);
    await interaction.reply({ embeds: [buildRankEmbed(user, userData)] });
  },

  async executePrefix(message, args) {
    const user = message.mentions.users.first() || message.author;
    const userData = await db.getUser(user.id);
    await message.reply({ embeds: [buildRankEmbed(user, userData)] });
  }
};