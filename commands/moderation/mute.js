const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLog } = require('../../utils/logger');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user to mute').setRequired(true))
    .addIntegerOption(opt => opt.setName('duration').setDescription('Duration in minutes').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the mute')),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: "No permission", ephemeral: true });
    }
    const member = interaction.options.getMember('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const role = interaction.guild.roles.cache.find(r => r.name === config.mutedRoleName);
    if (!role) return interaction.reply({ content: "Muted role not found.", ephemeral: true });
    await member.roles.add(role);
    await interaction.reply(`<@${member.id}> has been muted for **${duration} minute(s)**. Reason: ${reason}`);
    await sendLog(interaction.guild, {
      action: 'MUTE',
      target: member,
      moderator: interaction.member,
      reason,
      duration
    });
    setTimeout(async () => {
      await member.roles.remove(role);
      await sendLog(interaction.guild, {
        action: 'UNMUTE',
        target: member,
        moderator: { id: interaction.client.user.id },
        reason: 'Mute duration expired'
      });
    }, duration * 60 * 1000);
  },

  async executePrefix(message, args) {
    if (!args[0] || args[0] === 'help') {
      return message.reply('📖 **Syntax:** `!mute @user <duration in minutes> [reason]`\n**Example:** `!mute @John 10 Spamming`');
    }
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('No permission.');
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user to mute.\n📖 **Syntax:** `!mute @user <duration> [reason]`');
    const duration = parseInt(args[1]);
    if (!duration) return message.reply('❌ Please provide a duration in minutes.\n📖 **Syntax:** `!mute @user <duration> [reason]`');
    const reason = args.slice(2).join(' ') || 'No reason provided';
    const role = message.guild.roles.cache.find(r => r.name === config.mutedRoleName);
    if (!role) return message.reply('Muted role not found.');
    await member.roles.add(role);
    await message.reply(`<@${member.id}> has been muted for **${duration} minute(s)**. Reason: ${reason}`);
    await sendLog(message.guild, {
      action: 'MUTE',
      target: member,
      moderator: message.member,
      reason,
      duration
    });
    setTimeout(async () => {
      await member.roles.remove(role);
      await sendLog(message.guild, {
        action: 'UNMUTE',
        target: member,
        moderator: { id: message.client.user.id },
        reason: 'Mute duration expired'
      });
    }, duration * 60 * 1000);
  }
};