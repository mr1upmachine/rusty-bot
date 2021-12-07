import { CommandInteraction } from 'discord.js';
import { WriteBatch } from '@google-cloud/firestore';

// TODO: GDPR/CCPA compliance (applies to entire bot, tbh)
// TODO: Could use cleanup, intentionally leaving until theres a usecase for this

/** Collects guild member info into batches and processes them into Firebase */
export async function scanMembers(
  firestore: FirebaseFirestore.Firestore,
  interaction: CommandInteraction
) {
  // Replying immediately allows command to run for longer than 3 seconds.
  await interaction.reply({
    content: 'Beginning user import',
    ephemeral: true
  });

  const guild = interaction.guild;
  if (guild === null) {
    throw new Error('Guild cannot be null');
  }
  const guildRef = firestore.collection('guilds').doc(guild.id);

  const batchArray: WriteBatch[] = [];
  batchArray.push(firestore.batch());
  let operationCount = 0;
  let batchIndex = 0;

  // Setup Firestore batches into array
  for (const member of guild.members.cache.values()) {
    if (member.user.bot) {
      // Skips any bot members
      continue;
    }

    batchArray[batchIndex].set(
      guildRef.collection('members').doc(member.id),
      { name: member.displayName },
      { merge: true }
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
      .then((result) => {
        interaction.followUp({
          content: `User batch ${batchCount} updated in Firebase successfully.`,
          ephemeral: true
        });
        console.log(result);

        // Output when all batches are processed.
        if (batchCount === batchIndex + 1) {
          interaction.followUp(
            'All batches processed. To enable karma tracking, please use the `setmeme` command.'
          );
        }
        batchCount++;
      })
      .catch((err) => {
        interaction.followUp(
          `Batch ${batchCount} has encountered an error. See console for more details.`
        );
        console.log(err);
        batchCount++;
      });
  }
}
