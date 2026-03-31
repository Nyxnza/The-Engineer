const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../utils/levelSystem');

const LEVEL_THRESHOLDS = [
  { level: 30, xp: 3000 },
  { level: 15, xp: 1500 },
  { level: 5, xp: 500 },
  { level: 1, xp: 100 },
];

function getNextThreshold(xp) {
  for (const t of LEVEL_THRESHOLDS) {
    if (xp < t.xp) continue;
    const idx = LEVEL_THRESHOLDS.indexOf(t);
    if (idx === 0) return { next: t.xp, label: `Lv. ${t.level} (MAX)` };
    const next = LEVEL_THRESHOLDS[idx - 1];
    return { next: next.xp, label: `Lv. ${next.level}` };
  }
  return { next: 100, label: 'Lv. 1' };
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
      { name: 'Next Level', value: label, inline: true },
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
    const userData = db.getUser(user.id);
    await interaction.reply({ embeds: [buildRankEmbed(user, userData)] });
  },

  async executePrefix(message, args) {
    const user = message.mentions.users.first() || message.author;
    const userData = db.getUser(user.id);
    await message.reply({ embeds: [buildRankEmbed(user, userData)] });
  }
};