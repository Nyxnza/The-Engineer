const MEMBER_COUNT_CHANNEL_ID = '1488126508529877133';

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const countChannel = member.guild.channels.cache.get(MEMBER_COUNT_CHANNEL_ID);
    if (countChannel) {
      await countChannel.setName(`all-members-${member.guild.memberCount}`);
    }
  }
};