import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[]) => {
    if (args === undefined || args.length === 0) {
        const desc = module.exports.help.description;
        const name = module.exports.help.name;
        const usage = module.exports.help.usage;
        msg.channel.send(`Name: ${name}\nDescription: ${desc}\nUsage: ${usage}`);
        return;
    }
};

exports.help = {
  description: 'Set Rusty\'s current status.',
  name: 'Status',
  usage: 'status [playing | streaming | listening | watching] [message]',
};
