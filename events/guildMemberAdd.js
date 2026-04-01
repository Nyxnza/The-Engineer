const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const MEMBER_COUNT_CHANNEL_ID = '1488126508529877133';

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    // Welcome message
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (channel) {
      const embed = new EmbedBuilder()
        .setTitle('👋 Welcome to Engineria!')
        .setDescription(`<@${member.id}>\nWelcome to Engineria! Read the rules and have fun!`)
        .setColor('Blue')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Member #${member.guild.memberCount}` })
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    }

    // Update member count channel
    const countChannel = member.guild.channels.cache.get(MEMBER_COUNT_CHANNEL_ID);
    if (countChannel) {
      await countChannel.setName(`all-members-${member.guild.memberCount}`);
    }
  }
};