import { Firestore } from '@google-cloud/firestore';
import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[], firestore: Firestore) => {
  if (msg.member!.permissions.has('ADMINISTRATOR')) {
    // Ensures only admins may use this command

    let meme = false;

    if (args === undefined || args.length === 0) {
      const docRef = firestore
        .collection('guilds')
        .doc(msg.guild!.id)
        .collection('channels')
        .doc(msg.channel.id);

      docRef
        .get()
        .then(doc => {
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
        })
        .catch(err => {
          msg.channel.send('Error retrieving channel info: ' + err);
        });
      return;
    }

    meme = args[0].toLowerCase() === 'true';
    setMeme(msg, args, meme, firestore);
  } else {
    msg.channel.send('Error: insufficient permissions. Only Administrators may use this command.');
  }
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
