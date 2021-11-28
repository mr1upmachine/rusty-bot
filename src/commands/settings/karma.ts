import { CommandInteraction } from 'discord.js';

/** Enables or disables karma tracking on a channel in Firebase */
export async function karma(
  firestore: FirebaseFirestore.Firestore,
  interaction: CommandInteraction
) {
  const guildId = interaction.guildId;
  const channelName = interaction.channel?.toString();
  const channelId = interaction.channelId;
  let karmaValue = interaction.options.getBoolean('value');

  await interaction.deferReply({ ephemeral: true });

  if (guildId === null) throw new Error('GuildId cannot be null');

  const docRef = firestore
    .collection('guilds')
    .doc(guildId)
    .collection('channels')
    .doc(channelId);

  if (!karmaValue) {
    const karmaIsEnabled = (await docRef.get()).data()?.karmaTracking;
    karmaValue = karmaIsEnabled ? false : true;
  }

  docRef.set({ karmaTracking: karmaValue }, { merge: true });

  interaction.editReply(
    `Karma tracking for ${channelName} has been ${
      karmaValue ? 'enabled' : 'disabled'
    }.`
  );
}
