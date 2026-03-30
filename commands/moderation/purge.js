const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete a number of messages')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: "No permission", ephemeral: true });
    }
    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ Please provide a number between 1 and 100.', ephemeral: true });
    }
    await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `✅ Deleted **${amount}** messages.`, ephemeral: true });
    await sendLog(interaction.guild, {
      action: 'PURGE',
      target: { id: interaction.channel.id, user: { tag: `#${interaction.channel.name}` }, tag: `#${interaction.channel.name}` },
      moderator: interaction.member,
      reason: `Deleted ${amount} messages`
    });
  },

  async executePrefix(message, args) {
    if (!args[0] || args[0] === 'help') {
      return message.reply('📖 **Syntax:** `!purge <amount>`\n**Example:** `!purge 10`');
    }
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('No permission.');
    }
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('❌ Please provide a number between 1 and 100.\n📖 **Syntax:** `!purge <amount>`');
    }
    await message.channel.bulkDelete(amount + 1, true); // +1 to include the command message itself
    await sendLog(message.guild, {
      action: 'PURGE',
      target: { id: message.channel.id, user: { tag: `#${message.channel.name}` }, tag: `#${message.channel.name}` },
      moderator: message.member,
      reason: `Deleted ${amount} messages`
    });
  }
};