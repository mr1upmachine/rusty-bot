import { Client, Message } from 'discord.js';

exports.run = (client: Client, msg: Message, args: string[]) => {
  msg.channel.send('pong!');
};
