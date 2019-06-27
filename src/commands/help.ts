import { Client, Message } from 'discord.js';
import { readdir } from 'fs';
import { resolve } from 'path';

exports.run = (client: Client, msg: Message, args: string[]) => {
  // cycles through every file in commands and returns their help export.
  // if no args: list commands
    if (args === undefined || args.length === 0) {
    let commands = new Array<string>();
    const commandsFolder = resolve(__dirname, '../commands');
    readdir(resolve(commandsFolder), (err, files) => {
      files.forEach((file) => {
        commands.push(file);
      });
    });

    console.log(commands);
    msg.channel.send('The available commands are ' + commands.toString());
  }

};
