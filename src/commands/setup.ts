import { SlashCommandBuilder } from '@discordjs/builders';
import { WriteBatch } from '@google-cloud/firestore';
import { CommandInteraction, Guild, GuildMember } from 'discord.js';
import { Command } from '../utilities/command';

export default class SetupCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('setup')
      .setDescription('Configure Rusty for the first time');
  }

  async execute(interaction: CommandInteraction) {
    const guild = interaction.guild as Guild;
    const member = interaction.member as GuildMember;

    // Ensures only admins may use this command
    if (!member.permissions.has('ADMINISTRATOR')) {
      interaction.reply(
        'Error: insufficient permissions. Only Administrators may use this command.'
      );
      return;
    }

    const guildRef = this.firestore.collection('guilds').doc(guild.id);

    const batchArray: WriteBatch[] = [];
    batchArray.push(this.firestore.batch());
    let operationCount = 0;
    let batchIndex = 0;

    // Setup Firestore batches into array
    for (const member of guild.members.cache.values()) {
      if (member.user.bot) {
        continue;
      } // Skips any bot members

      batchArray[batchIndex].set(
        guildRef.collection('members').doc(member.id),
        { name: member.displayName },
        { merge: true }
      );
      operationCount++;

      // Firestore batches have a limit of 500 operations
      if (operationCount === 499) {
        batchArray.push(this.firestore.batch());
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
          interaction.reply(
            `User batch ${batchCount} updated in Firebase successfully.`
          );
          console.log(result);

          // Output when all batches are processed.
          if (batchCount === batchIndex + 1) {
            interaction.reply(
              'All batches processed. To enable karma tracking, please use the `setmeme` command.'
            );
          }
          batchCount++;
        })
        .catch((err) => {
          interaction.reply(
            `Batch ${batchCount} has encountered an error. See console for more details.`
          );
          console.log(err);
          batchCount++;
        });
    }
  }
}
