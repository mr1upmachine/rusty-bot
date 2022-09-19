import type { Firestore } from '@google-cloud/firestore';
import type { VoiceBasedChannel } from 'discord.js';

import { getChannelFirestoreReference } from '../../../../utilities/firestore-helper.js';

export async function setRandomVoiceChannelNamesChannelConfig(
  firestore: Firestore,
  channel: VoiceBasedChannel,
  value: boolean | null
): Promise<string> {
  // Set value in database
  const docRef = getChannelFirestoreReference(firestore, channel);
  await docRef.set({ randomVoiceChannelNames: value }, { merge: true });

  // Build response text
  const valueText = value ? 'enabled' : 'disabled';
  const response = `Random voice channel names for ${channel.name} have been ${valueText}.`;
  return response;
}
