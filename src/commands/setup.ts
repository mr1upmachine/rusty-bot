import { Firestore, WriteBatch } from '@google-cloud/firestore';
import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[], firestore: Firestore) => {
  if (!msg.member!.permissions.has('ADMINISTRATOR')) {
    // Ensures only admins may use this command
    msg.channel.send('Error: insufficient permissions. Only Administrators may use this command.');
    return;
  }

  const guildRef = firestore.collection('guilds').doc(msg.guild!.id);

  const batchArray: WriteBatch[] = [];
  batchArray.push(firestore.batch());
  let operationCount = 0;
  let batchIndex = 0;

  // Setup Firestore batches into array
  for (const member of msg.guild!.members.cache.array()) {
    if (member.user.bot) {
      continue;
    } // Skips any bot members

    batchArray[batchIndex].set(
      guildRef.collection('members').doc(member.id),
      { name: member.displayName },
      { merge: true },
    );
    operationCount++;

    // Firestore batches have a limit of 500 operations
    if (operationCount === 499) {
      batchArray.push(firestore.batch());
      batchIndex++;
      operationCount = 0;
    }
  }

  // Write batches to Firestore
  let batchCount = 1;
  for (const batch of batchArray) {
    await batch
      .commit()
      .then(result => {
        msg.channel.send(`User batch ${batchCount} updated in Firebase successfully.`);
        console.log(result);

        // Output when all batches are processed.
        if (batchCount === batchIndex + 1) {
          msg.channel.send('All batches processed. To enable karma tracking, please use the `setmeme` command.');
        }
        batchCount++;
      })
      .catch(err => {
        msg.channel.send(`Batch ${batchCount} has encountered an error. See console for more details.`);
        console.log(err);
        batchCount++;
      });
  }
};

exports.help = {
  description: 'Configure Rusty for the first time',
  name: 'Setup',
  usage: 'setup',
};
