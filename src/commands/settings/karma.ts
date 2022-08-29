import { ChatInputCommandInteraction } from 'discord.js';

/** Enables or disables karma tracking on a channel in Firebase */
export async function karma(
  firestore: FirebaseFirestore.Firestore,
  interaction: ChatInputCommandInteraction
) {
  const guildId = interaction.guildId;
  const channelName = interaction.channel?.toString();
  const channelId = interaction.channelId;
  let karmaValue = interaction.options.getBoolean('value');

  await interaction.deferReply({ ephemeral: true });

  if (guildId === null) {
    throw new Error('GuildId cannot be null');
  }

  const docRef = firestore
    .collection('guilds')
    .doc(guildId)
    .collection('channels')
    .doc(channelId);

  if (!karmaValue) {
    const karmaIsEnabled = (await docRef.get()).data()?.karmaTracking;
    karmaValue = !karmaIsEnabled;
  }

  docRef.set({ karmaTracking: karmaValue }, { merge: true });

  const karmaValueText = karmaValue ? 'enabled' : 'disabled';

  interaction.editReply(
    `Karma tracking for ${channelName} has been ${karmaValueText}.`
  );
}
