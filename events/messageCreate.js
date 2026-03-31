const PREFIX = '!';
const ALIASES = {
  'h': 'help'
};

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message || message.author?.bot) return;
    if (!message.content?.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    let commandName = args.shift().toLowerCase();

    // Resolve aliases
    if (ALIASES[commandName]) commandName = ALIASES[commandName];

    const command = client.commands.get(commandName);
    if (!command) return;
    if (!command.executePrefix) return;

    try {
      await command.executePrefix(message, args, client);
    } catch (err) {
      console.error(err);
      message.reply('There was an error executing that command.');
    }
  }
};