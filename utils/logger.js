const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

async function sendLog(guild, { action, target, moderator, reason, duration }) {
  const logChannel = guild.channels.cache.get(config.logChannelId);

  if (!logChannel) {
    console.log(`[LOG ERROR] Could not find channel with ID: "${config.logChannelId}"`);
    return;
  }

  const colors = {
    BAN: 'Red',
    KICK: 'Orange',
    MUTE: 'Yellow',
    WARN: 'Blue',
    UNMUTE: 'Green',
    PURGE: 'Purple'
  };

  const embed = new EmbedBuilder()
    .setTitle(`🔨 ${action}`)
    .addFields(
      { name: 'User', value: `<@${target.id}> (${target.user?.tag || target.tag})`, inline: true },
      { name: 'Moderator', value: `<@${moderator.id}>`, inline: true },
      { name: 'Reason', value: reason || 'No reason provided', inline: false }
    )
    .setColor(colors[action] || 'Grey')
    .setTimestamp();

  if (duration) embed.addFields({ name: 'Duration', value: `${duration} minute(s)`, inline: true });

  await logChannel.send({ embeds: [embed] });
}

module.exports = { sendLog };