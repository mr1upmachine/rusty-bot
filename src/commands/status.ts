import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[]) => {
  if (args === undefined || args.length === 0) {
    const desc = module.exports.help.description;
    const name = module.exports.help.name;
    const usage = module.exports.help.usage;
    msg.channel.send(`Name: ${name}\nDescription: ${desc}\nUsage: ${usage}`);
    return;
  }

  if (args[0].match(/^(playing|listening|watching)$/i)) {
    client.user!.setActivity(args.slice(1).join(' '), { type: args[0].toUpperCase() as any })
    return;
  }
  
  const desc = module.exports.help.description;
  const name = module.exports.help.name;
  const usage = module.exports.help.usage;
  msg.channel.send(`Name: ${name}\nDescription: ${desc}\nUsage: ${usage}`);

};

exports.help = {
  description: "Set Rusty's current status.",
  name: 'Status',
  usage: 'status [playing | listening | watching] [activity]'
};

// Technically, 'streaming' is also an option but it doesn't seem to work without a URL, so I've not enabled it for now.
