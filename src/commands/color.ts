import { Client, Message } from 'discord.js';

exports.run = (client: Client, msg: Message, args: string[]) => {
  const roleName = `USER-${msg.author.id}`;
  const myRole = msg.guild.roles.find((role) => role.name === roleName);
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
    msg.guild.createRole({ // Creates new role with user selected color
      color: chosenColor,
      name: roleName,
    }).then(() => msg.member.addRole(msg.guild.roles.find((role) => role.name === roleName))); // Assigns created role to user
    msg.channel.send('Role created!');
  } else {
    myRole.edit({ // Edits existing role with user selected color
      color: chosenColor,
    });
    msg.channel.send('Color changed!');
  }
};

exports.help = {
  description: 'Changes the color of the user\'s name.',
  name: 'Color Change',
  usage: 'color <hex code>',
};
