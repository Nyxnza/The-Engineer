const { SlashCommandBuilder } = require('discord.js');

const responses = [
  '✅ Yes, definitely!', '✅ It is certain.', '✅ Without a doubt.',
  '✅ Most likely.', '✅ Signs point to yes.', '❓ Ask again later.',
  '❓ Cannot predict now.', '❓ Better not tell you now.',
  '❌ Don\'t count on it.', '❌ My sources say no.',
  '❌ Very doubtful.', '❌ Outlook not so good.'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8ball a question')
    .addStringOption(opt => opt.setName('question').setDescription('Your question').setRequired(true)),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const response = responses[Math.floor(Math.random() * responses.length)];
    await interaction.reply(`🎱 **Question:** ${question}\n**Answer:** ${response}`);
  },

  async executePrefix(message, args) {
    if (!args[0] || args[0] === 'help') {
      return message.reply('📖 **Syntax:** `!8ball <question>`\n**Example:** `!8ball Will I win?`');
    }
    const question = args.join(' ');
    const response = responses[Math.floor(Math.random() * responses.length)];
    await message.reply(`🎱 **Question:** ${question}\n**Answer:** ${response}`);
  }
};