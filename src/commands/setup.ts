import { FieldValue, Firestore } from '@google-cloud/firestore';
import { Client, Message } from 'discord.js';

// TODO: Unknown behavior in large servers, batch most likely fails with 500+ users.
// TODO: Make success message tied to batch with .then()

exports.run = async (client: Client, msg: Message, args: string[], firestore: Firestore) => {
    if (msg.member!.permissions.has('ADMINISTRATOR') ) { // Ensures only admins may use this command
        const guildRef = firestore.collection('guilds').doc(msg.guild!.id);

        const batch = firestore.batch();
        msg.guild!.members.forEach((member) => {
            if (!member.user.bot) {
                console.log(member.displayName + '   ' + member.user.bot);
                batch.set(guildRef.collection('members').doc(member.id), {name: member.displayName}, {merge: true});
            }
        });
        batch.commit();
        msg.channel.send(`Updated member profiles in Firebase.`);
    } else {
        msg.channel.send('Error: insufficient permissions. Only Administrators may use this command.');
    }
};

exports.help = {
  description: 'Configure Rusty for the first time',
  name: 'Setup',
  usage: 'setup',
};

/* Things this command should do:
Instantiate all guild members in firebase, with name/nickname and post count (if possible)
Inform the user to use !setmeme to configure meme channels
*/
