import { Firestore } from '@google-cloud/firestore';
import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[], firestore: Firestore) => {
  // Ensures only admins may use this command
  if (!msg.member!.permissions.has('ADMINISTRATOR')) {
    msg.channel.send('Error: insufficient permissions. Only Administrators may use this command.');
    return;
  }

  let meme = false;

  if (args === undefined || args.length === 0) {
    const docRef = firestore
      .collection('guilds')
      .doc(msg.guild!.id)
      .collection('channels')
      .doc(msg.channel.id);

    try {
      const doc = await docRef.get();
      if (!doc.exists) {
        msg.channel.send('This channel is not flagged as a meme channel.');
        return;
      } else {
        if (doc.data()!.meme) {
          meme = doc.data()!.meme;
        }

        if (meme) {
          msg.channel.send('This channel is flagged as a meme channel.');
        } else {
          msg.channel.send('This channel is not flagged as a meme channel.');
        }
      }
    } catch (err) {
      msg.channel.send('Error retrieving channel info: ' + err);
    }
    return;
  }

  meme = args[0].toLowerCase() === 'true';
  setMeme(msg, args, meme, firestore);
};

exports.help = {
  description: 'Sets the meme channel for stat tracking',
  name: 'Set Meme',
  usage: 'setmeme [true | false]',
};

function setMeme(msg: Message, args: string[], isMeme: boolean, firestore: Firestore) {
  const docRef = firestore
    .collection('guilds')
    .doc(msg.guild!.id)
    .collection('channels')
    .doc(msg.channel.id);

  docRef.set(
    {
      meme: isMeme,
    },
    { merge: true },
  );

  msg.channel.send(`Meme channel set to ${args[0]}.`);
}
