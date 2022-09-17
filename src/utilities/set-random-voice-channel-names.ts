import type { Guild, VoiceBasedChannel } from 'discord.js';

import { getRandomVoiceChannelNamesFromFile } from './get-random-voice-channel-names-from-file.js';

/** Default channel name if a list is too short to foll all the slots */
const DEFAULT_CHANNEL_NAME = 'Voice Channel';

export async function setRandomVoiceChannelNames(guild: Guild): Promise<void> {
  const { groups } = await getRandomVoiceChannelNamesFromFile();

  // Get random group
  const randomGroupIndex = Math.floor(Math.random() * groups.length);
  const names = [...groups[randomGroupIndex].names];

  // Get voice channels for the current server
  const allChannels = Array.from(guild.channels.cache);
  const voiceChannels: readonly VoiceBasedChannel[] = allChannels
    .map(([, channel]) => channel)
    .filter((channel) => channel.isVoiceBased()) as VoiceBasedChannel[];

  // Get list of random names
  let numDefaultVoiceChannelNames = 0;
  const nameChannelMap: [string, VoiceBasedChannel][] = voiceChannels.map(
    (voiceChannel) => {
      if (names.length === 0) {
        const defaultName = `${DEFAULT_CHANNEL_NAME} ${++numDefaultVoiceChannelNames}`;
        return [defaultName, voiceChannel];
      }

      const randomIndex = Math.floor(Math.random() * names.length);
      const [randomName] = names.splice(randomIndex, 1);
      return [randomName, voiceChannel];
    }
  );

  // Set voice channel names
  for (const [randomName, voiceChannel] of nameChannelMap) {
    try {
      // TODO wait on response and log if unable to set the name
      await voiceChannel.setName(randomName);
    } catch (e: unknown) {
      console.log('VC NAME ERROR', e);
    }
  }
}
