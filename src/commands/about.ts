import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[]) => {
  const version: string = require('../utilities/version');
  msg.channel.send("Hi, I'm Rusty, mascot of the Rusty's Bois server! My current version is " + version + '!');
};

exports.help = {
  description: 'Displays version information',
  name: 'About',
  usage: 'about',
};
