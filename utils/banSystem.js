const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

const REQUIRED_APPROVALS = 2; // 2 out of 3 roles must confirm

async function requestBan(interaction, member) {
  const guild = interaction.guild;
  const targetUser = member.user;

  // Build the confirmation embed
  const embed = new EmbedBuilder()
    .setTitle('⚠️ Ban Request')
    .setDescription(`**${interaction.user.tag}** has requested to ban **${targetUser.tag}**.\n\nReact with ✅ to approve. **${REQUIRED_APPROVALS} approvals required.**`)
    .setColor('Red')
    .setTimestamp();

  const msg = await interaction.reply({
    embeds: [embed],
    fetchReply: true
  });

  await msg.react('✅');
  await msg.react('❌');

  const approvals = new Set(); // track who already voted

  const collector = msg.createReactionCollector({
    filter: (reaction, user) => {
      if (user.bot) return false;
      if (!['✅', '❌'].includes(reaction.emoji.name)) return false;

      // Check if the user has at least one approver role
      const member = guild.members.cache.get(user.id);
      if (!member) return false;

      const hasApproverRole = config.approverRoles.some(roleId =>
        member.roles.cache.has(roleId)
      );

      return hasApproverRole;
    },
    time: 5 * 60 * 1000 // 5 minute window
  });

  collector.on('collect', async (reaction, user) => {
    // Prevent the same person from voting twice
    if (approvals.has(user.id)) return;

    if (reaction.emoji.name === '❌') {
      collector.stop('denied');
      return;
    }

    if (reaction.emoji.name === '✅') {
      approvals.add(user.id);

      if (approvals.size >= REQUIRED_APPROVALS) {
        collector.stop('approved');
      }
    }
  });

  collector.on('end', async (_, reason) => {
    if (reason === 'approved') {
      try {
        await guild.members.ban(targetUser.id, { reason: `Ban approved by ${approvals.size} moderators.` });

        await msg.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle('✅ Ban Executed')
              .setDescription(`**${targetUser.tag}** has been banned. Approved by ${approvals.size} moderators.`)
              .setColor('Green')
              .setTimestamp()
          ]
        });
      } catch (err) {
        await msg.edit({ content: '❌ Failed to ban the user. Check my permissions.', embeds: [] });
        console.error(err);
      }

    } else if (reason === 'denied') {
      await msg.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ Ban Denied')
            .setDescription(`The ban request for **${targetUser.tag}** was denied.`)
            .setColor('Grey')
            .setTimestamp()
        ]
      });

    } else {
      // Timed out
      await msg.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle('⏰ Ban Request Expired')
            .setDescription(`The ban request for **${targetUser.tag}** expired without enough approvals.`)
            .setColor('Yellow')
            .setTimestamp()
        ]
      });
    }
  });
}

module.exports = { requestBan };