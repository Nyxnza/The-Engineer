const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
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

    // Auto unmute after duration
    setTimeout(async () => {
      await member.roles.remove(role);
    }, duration * 60 * 1000);
  }
};