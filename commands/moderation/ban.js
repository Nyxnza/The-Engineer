const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { requestBan } = require('../../utils/banSystem.js');

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
  }
};