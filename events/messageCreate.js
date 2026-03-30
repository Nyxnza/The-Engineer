const config = require('../config.json');

const PREFIX = '!';

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    // Create a fake interaction-like object to reuse existing command logic
    try {
      await command.executePrefix(message, args, client);
    } catch (err) {
      console.error(err);
      message.reply('There was an error executing that command.');
    }
  }
};