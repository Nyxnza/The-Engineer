const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user to mute').setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: "No permission", ephemeral: true });
    }

    const member = interaction.options.getMember('user');
    const role = interaction.guild.roles.cache.find(r => r.name === config.mutedRoleName);

    if (!role) return interaction.reply("Muted role not found.");

    await member.roles.add(role);

    interaction.reply(`${member.user.tag} muted.`);
  }
};