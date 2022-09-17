import type { Firestore } from '@google-cloud/firestore';
import type { Guild } from 'discord.js';

import { disableRandomVoiceChannelNames } from '../../utilities/disable-random-voice-channel-names.js';
import { enableRandomVoiceChannelNames } from '../../utilities/enable-random-voice-channel-names.js';
import { getGuildFirestoreReference } from '../../utilities/firestore-helper.js';

export async function setRandomVoiceChannelNamesConfig(
  firestore: Firestore,
  guild: Guild,
  value: boolean | null
): Promise<string> {
  // Set value in database
  const docRef = getGuildFirestoreReference(firestore, guild);
  await docRef.set({ enableVoiceChannelNames: value }, { merge: true });

  // Enable / disable feature
  if (value) {
    enableRandomVoiceChannelNames(guild);
  } else {
    disableRandomVoiceChannelNames(guild);
  }

  // Build response text
  const valueText = value ? 'enabled' : 'disabled';
  const response = `Random voice channel names have been ${valueText}.`;
  return response;
}
