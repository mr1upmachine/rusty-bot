import { Firestore } from '@google-cloud/firestore';
import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[], firestore: Firestore) => {
  if (args === undefined || args.length === 0) {
    const desc = module.exports.help.description;
    const name = module.exports.help.name;
    const usage = module.exports.help.usage;
    msg.channel.send(`Name: ${name}\nDescription: ${desc}\nUsage: ${usage}`);
    return;
  }

  const userRef = firestore.collection('guilds').doc(msg.guild!.id).collection('members').doc(msg.member!.id);

  switch (args[0].toLowerCase()) {
    case 'color':
      if (!args[1]) {
        msg.channel.send('Please input a valid hex color code!');
        return;
      }

      let chosenColor = args[1].toUpperCase();

      const isValidHex = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i.test(chosenColor);
      if (!isValidHex) {
        msg.channel.send('Please input a valid hex color code!');
        return;
      }

      const isShortenedHex = /(^#?[0-9A-F]{3}$)/i.test(chosenColor);
      if (isShortenedHex) {
        chosenColor = chosenColor.replace(/#?([0-9A-F])([0-9A-F])([0-9A-F])/, '$1$1$2$2$3$3');
      }
      userRef.set(
        {
          infoColor: chosenColor
        },
        { merge: true }
      );

      msg.channel.send(`Color set to ${chosenColor}!`);
      break;
    case 'about':
      const userAbout = args.slice(1).join(' ');
      if (userAbout.length <= 2048) {
        userRef.set(
          {
            about: userAbout
          },
          { merge: true }
        );

        if (!args[1]) {
          msg.channel.send('About cleared!');
        } else {
          msg.channel.send('About set!');
        }
      } else {
        msg.channel.send('About sections can only be up to 2048 characters in length!');
      }
      break;
    default:
      msg.channel.send('Usage: ' + module.exports.help.usage);
  }
};

exports.help = {
  description: 'Customize your user card!',
  name: 'Profile',
  usage: 'profile <color [hexcode]> | <about [text]>'
};
