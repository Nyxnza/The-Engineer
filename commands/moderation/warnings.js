const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Check the warnings of a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user to check').setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: "No permission", ephemeral: true });
    }
    const user = interaction.options.getUser('user');
    const warns = db.getWarns(user.id);

    const embed = buildWarningsEmbed(user.tag, user.id, warns);
    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message, args) {
    if (!args[0] || args[0] === 'help') {
      return message.reply('📖 **Syntax:** `!warnings @user`\n**Example:** `!warnings @John`');
    }
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply('No permission.');
    }
    const user = message.mentions.users.first();
    if (!user) return message.reply('❌ Please mention a user.\n📖 **Syntax:** `!warnings @user`');

    const warns = db.getWarns(user.id);
    const embed = buildWarningsEmbed(user.tag, user.id, warns);
    await message.reply({ embeds: [embed] });
  }
};

function buildWarningsEmbed(tag, id, warns) {
  const embed = new EmbedBuilder()
    .setTitle(`⚠️ Warnings for ${tag}`)
    .setColor('Yellow')
    .setTimestamp();

  if (!warns || warns.length === 0) {
    embed.setDescription('This user has no warnings.');
  } else {
    embed.setDescription(`This user has **${warns.length}** warning(s).`);
    warns.forEach((warn, index) => {
      embed.addFields({
        name: `Warning #${index + 1}`,
        value: `**Reason:** ${warn.reason}\n**Date:** ${new Date(warn.date).toLocaleString()}`,
        inline: false
      });
    });
  }

  return embed;
}