const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { requestBan } = require('../../utils/banSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user (requires approval)')
    .addUserOption(opt => opt.setName('user').setDescription('The user to ban').setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: "No permission", ephemeral: true });
    }
    const member = interaction.options.getMember('user');
    await requestBan(interaction, member);
  },

  async executePrefix(message, args) {
    if (!args[0] || args[0] === 'help') {
      return message.reply('📖 **Syntax:** `!ban @user`\n**Example:** `!ban @John`');
    }
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply('No permission.');
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Please mention a user to ban.\n📖 **Syntax:** `!ban @user`');
    await requestBan({
      guild: message.guild,
      user: message.author,
      reply: (data) => message.reply(data),
      fetchReply: true
    }, member);
  }
};