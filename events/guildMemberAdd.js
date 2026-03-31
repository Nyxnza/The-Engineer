const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel) {
      console.log('[WELCOME ERROR] Could not find welcome channel.');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('👋 Welcome to Engineria!')
      .setDescription(`<@${member.id}>\nWelcome to Engineria! Read the rules and have fun!`)
      .setColor('Blue')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Member #${member.guild.memberCount}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  }
};