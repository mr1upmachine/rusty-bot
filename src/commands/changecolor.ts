import { Client, Message } from 'discord.js';

exports.run = (client: Client, msg: Message, args: string[]) => {
// tslint:disable-next-line: no-console
  console.log(msg.content);
};
