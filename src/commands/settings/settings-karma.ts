import type { ChatInputCommandInteraction } from 'discord.js';

import { getChannelFirestoreReference } from '../../utilities/firestore-helper.js';

/** Enables or disables karma tracking on a channel in Firebase */
export async function karma(
  firestore: FirebaseFirestore.Firestore,
  interaction: ChatInputCommandInteraction<'cached' | 'raw'>
): Promise<void> {
  let karmaTracking = interaction.options.getBoolean('value');
  const channel = interaction.channel;
  if (!channel) {
    throw new Error();
  }

  const channelName = channel.name;

  await interaction.deferReply({ ephemeral: true });

  const docRef = getChannelFirestoreReference(firestore, channel);

  if (!karmaTracking) {
    const karmaTrackingIsEnabled = (await docRef.get()).data()?.karmaTracking;
    karmaTracking = !karmaTrackingIsEnabled;
  }

  await docRef.set({ karmaTracking }, { merge: true });

  const karmaTrackingValue = karmaTracking ? 'enabled' : 'disabled';

  await interaction.editReply(
    `Karma tracking for ${channelName} has been ${karmaTrackingValue}.`
  );
}
