const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user to kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for the kick')),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: "No permission", ephemeral: true });
    }
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await member.kick(reason);
    await interaction.reply(`<@${member.id}> has been kicked. Reason: ${reason}`);
    await sendLog(interaction.guild, {
      action: 'KICK',
      target: member,
      moderator: interaction.member,
      reason
    });
  },

  async executePrefix(message, args) {
    if (!args[0] || args[0] === 'help') {
      return message.reply('📖 **Syntax:** `!kick @user [reason]`\n**Example:** `!kick @John Breaking rules`');
    }
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('No permission.');
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user to kick.\n📖 **Syntax:** `!kick @user [reason]`');
    const reason = args.slice(1).join(' ') || 'No reason provided';
    await member.kick(reason);
    await message.reply(`<@${member.id}> has been kicked. Reason: ${reason}`);
    await sendLog(message.guild, {
      action: 'KICK',
      target: member,
      moderator: message.member,
      reason
    });
  }
};