import { Firestore } from '@google-cloud/firestore';
import { Client, Message } from 'discord.js';

// TODO: Allow option to remove meme flag from a channel

exports.run = (client: Client, msg: Message, args: string[], firestore: Firestore) => {

  if (msg.member!.permissions.has('ADMINISTRATOR') ) { // Ensures only admins may use this command

    const docRef = firestore.collection('guilds').doc(msg.guild!.id).collection('channels').doc(args[0]);

    const setWithOptions = docRef.set({
        meme: true,
    }, {merge: true});

    msg.channel.send(`Meme channel set to ${args[0]}.`);
  } else {
    msg.channel.send('Error: insufficient permissions. Only Administrators may use this command.');
  }
};

exports.help = {
  description: 'Sets the meme channel for stat tracking',
  name: 'Set Meme',
  usage: 'setmeme <channel id>',
};
