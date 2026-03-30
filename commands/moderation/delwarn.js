const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delwarn')
    .setDescription('Delete a specific warning')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to remove warning from')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('number')
        .setDescription('Warning number')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: "No permission", ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const number = interaction.options.getInteger('number');

    const success = db.removeWarn(user.id, number - 1);

    if (!success) {
      return interaction.reply({ content: "Invalid warning number.", ephemeral: true });
    }

    await interaction.reply(`✅ Removed warning #${number} from ${user.tag}`);
  },

  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('No permission.');
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ Mention a user.');

    const number = parseInt(args[1]);
    if (!number) return message.reply('❌ Provide warning number.');

    const success = db.removeWarn(member.id, number - 1);

    if (!success) {
      return message.reply('❌ Invalid warning number.');
    }

    message.reply(`✅ Removed warning #${number} from ${member.user.tag}`);
  }
};