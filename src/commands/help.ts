import { Client, Message } from 'discord.js';
import { readdir } from 'fs';
import { resolve } from 'path';

exports.run = async (client: Client, msg: Message, args: string[]) => {
  // IF no args: output list of commands
  if (args === undefined || args.length === 0) {

    // find commands folder based on relative directory.
    const commandsFolder = resolve(__dirname, '../commands');

    // Add all files in command folder to string and format to remove file extensions
    readdir(resolve(commandsFolder), (err, files) => {
      const commands = files.toString().replace(/(\.ts,)|(\.js,)/g, ', ').replace(/(\.ts)|(\.js)/g, '');

      // Output list of commands
      msg.channel.send(`The available commands are: ${commands}\nUse help <command> for detailed information.`);
    });
  } else {
    const cmd = args[0];

    try {
      // Load command module and break help object into individual strings
      const cmdFile = require(`./${cmd}`);
      const name = cmdFile.help.name;
      const desc = cmdFile.help.description;
      const use = cmdFile.help.usage;

      // Output command help info
      msg.channel.send(`Name: ${name}\nDescription: ${desc}\nUsage: ${use}`);
    } catch (e) {
      // Output error if command not found
      msg.channel.send('No such command: ' + cmd);
      return;
    }
  }
};

exports.help = {
  description: 'Displays a list of commands or detailed information about a specific command.',
  name: 'Help',
  usage: 'help [command]',
};
