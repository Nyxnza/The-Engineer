const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const helpEmbed = () => new EmbedBuilder()
  .setTitle('📖 The Engineer — Command List')
  .setColor('Blurple')
  .setTimestamp()
  .addFields(
    {
      name: '🔨 Moderation Commands',
      value: [
        '`!ban @user` / `/ban` — Request a ban (requires 2/3 approver roles to confirm)',
        '`!kick @user [reason]` / `/kick` — Kick a user from the server',
        '`!slime @user <duration> [reason]` / `/slime` — Mute a user (e.g. `10s`, `5m`, `2h`)',
        '`!unslime @user` / `/unslime` — Manually remove slime from a user',
        '`!warn @user [reason]` / `/warn` — Give a user a warning',
        '`!warnings @user` / `/warnings` — View all warnings for a user',
        '`!delwarn @user <number>` / `/delwarn` — Delete a specific warning by number',
        '`!purge <amount>` / `/purge` — Bulk delete messages (1-100)',
        '`!rank [@user]` / `/rank` — Check your XP and level progress',
        '`!lb [daily|weekly|monthly|alltime]` / `/leaderboard` — Show the message leaderboard',
      ].join('\n'),
      inline: false
    },
    {
      name: '🎱 Fun Commands',
      value: [
        '`!8ball <question>` / `/8ball` — Ask the magic 8ball a question',
        '`!help` / `!h` / `/help` — Show this help menu',
      ].join('\n'),
      inline: false
    },
    {
      name: '💡 Tips',
      value: [
        'All commands support both `!prefix` and `/slash` style',
        'Add `help` after any command to see its syntax e.g. `!slime help`',
        'Slash commands show options automatically when you type them',
      ].join('\n'),
      inline: false
    }
  )
  .setFooter({ text: 'The Engineer Bot' });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all commands and how to use them'),

  async execute(interaction) {
    await interaction.reply({ embeds: [helpEmbed()], ephemeral: true });
  },

  async executePrefix(message, args) {
    await message.reply({ embeds: [helpEmbed()] });
  }
};