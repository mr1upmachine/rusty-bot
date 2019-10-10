import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[]) => {
  msg.channel.send('pong!');
};

exports.help = {
  description: 'Play table tennis!',
  name: 'Ping',
  usage: 'ping',
};
