const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLog } = require('../../utils/logger');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unslime')
    .setDescription('Remove slime (unmute) from a user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('User to unslime')
        .setRequired(true)
    ),

  // 🔥 SLASH COMMAND
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: "No permission", ephemeral: true });
    }

    const member = interaction.options.getMember('user');
    const role = interaction.guild.roles.cache.find(r => r.name === config.mutedRoleName);

    if (!role) {
      return interaction.reply({ content: "Role not found.", ephemeral: true });
    }

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({ content: "❌ User is not slimed.", ephemeral: true });
    }

    await member.roles.remove(role);

    await interaction.reply(`✅ ${member} has been unslimed by ${interaction.member}`);

    await sendLog(interaction.guild, {
      action: 'UNSLIME',
      target: member,
      moderator: interaction.member,
      reason: 'Manual unslime'
    });
  },

  // 🔥 PREFIX COMMAND
  async executePrefix(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply('No permission.');
    }

    if (!args[0] || args[0] === 'help') {
      return message.reply(
        '📖 **Syntax:** `!unslime @user`\n**Example:** `!unslime @John`'
      );
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('❌ Please mention a user.\n📖 `!unslime @user`');
    }

    const role = message.guild.roles.cache.find(r => r.name === config.mutedRoleName);
    if (!role) return message.reply('Role not found.');

    if (!member.roles.cache.has(role.id)) {
      return message.reply('❌ User is not slimed.');
    }

    await member.roles.remove(role);

    await message.reply(`✅ ${member} has been unslimed by ${message.author}`);

    await sendLog(message.guild, {
      action: 'UNSLIME',
      target: member,
      moderator: message.member,
      reason: 'Manual unslime'
    });
  }
};