import type { Firestore } from '@google-cloud/firestore';
import type { GuildTextBasedChannel } from 'discord.js';

import { getChannelFirestoreReference } from '../../../../utilities/firestore-helper.js';

/** Enables or disables karma tracking on a channel in Firebase */
export async function setKarmaTrackingConfig(
  firestore: Firestore,
  channel: GuildTextBasedChannel,
  value: boolean | null
): Promise<string> {
  // Set value in database
  const docRef = getChannelFirestoreReference(firestore, channel);
  await docRef.set({ karmaTracking: value }, { merge: true });

  // Build response text
  const valueText = value ? 'enabled' : 'disabled';
  const response = `Karma tracking for ${channel.name} has been ${valueText}.`;
  return response;
}
