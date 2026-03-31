const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user to warn').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('The reason for the warning')),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: "No permission", ephemeral: true });
    }
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await db.addWarn(user.id, reason);
    await interaction.reply(`<@${user.id}> has been warned. Reason: ${reason}`);
    await sendLog(interaction.guild, {
      action: 'WARN',
      target: user,
      moderator: interaction.member,
      reason
    });
  },

  async executePrefix(message, args) {
    if (!args[0] || args[0] === 'help') {
      return message.reply('📖 **Syntax:** `!warn @user [reason]`\n**Example:** `!warn @John Toxic behavior`');
    }
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('No permission.');
    }
    const user = message.mentions.users.first();
    if (!user) return message.reply('❌ Please mention a user to warn.\n📖 **Syntax:** `!warn @user [reason]`');
    const reason = args.slice(1).join(' ') || 'No reason provided';
    db.addWarn(user.id, reason);
    await message.reply(`<@${user.id}> has been warned. Reason: ${reason}`);
    await sendLog(message.guild, {
      action: 'WARN',
      target: user,
      moderator: message.member,
      reason
    });
  }
};