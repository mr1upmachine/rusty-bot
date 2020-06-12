import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[]) => {
  if (args === undefined || args.length === 0) {
    const desc = module.exports.help.description;
    const name = module.exports.help.name;
    const usage = module.exports.help.usage;
    msg.channel.send(`Name: ${name}\nDescription: ${desc}\nUsage: ${usage}`);
    return;
  }

  const roleName = `USER-${msg.author!.id}`;
  const myRole = msg.guild!.roles.cache.find((role: { name: string; }) => role.name === roleName);
  let chosenColor = args[0].toUpperCase();

  const isValidHex = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i.test(chosenColor); // Test if chosenColor is valid
  if (!isValidHex) {
    msg.channel.send('Please input a valid hex color code!'); // Output error message to discord channel
    return;
  }

  const isShortenedHex = /(^#?[0-9A-F]{3}$)/i.test(chosenColor); // Tests if chosenColor is a 3 character code
  if (isShortenedHex) {
    chosenColor = chosenColor.replace(/#?([0-9A-F])([0-9A-F])([0-9A-F])/, '#$1$1$2$2$3$3'); // Convert 3 character hex codes to 6 characters
  }

  if (!myRole) {
    try {
      const createdRole = await msg.guild!.roles.create({
        data: {
          // Creates new role with user selected color
          color: chosenColor,
          name: roleName,
        },
      });

      msg.member!.roles.add(createdRole); // Assigns newly created role to user

      msg.channel.send(`Role created with color ${chosenColor}`);
    } catch (e) {
      return;
    }
  } else {
    // Updates existing role with new color
    myRole.edit({
      color: chosenColor,
    });
    msg.channel.send(`Color changed to ${chosenColor}`);
  }
};

exports.help = {
  description: "Changes the color of the user's name.",
  name: 'Color Change',
  usage: 'color <hex code>',
};
