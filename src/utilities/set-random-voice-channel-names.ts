import type { VoiceBasedChannel } from 'discord.js';

import { getRandomVoiceChannelNamesFromFile } from './get-random-voice-channel-names-from-file.js';

/** Default channel name if a list is too short to foll all the slots */
const DEFAULT_CHANNEL_NAME = 'Voice Channel';

export async function setRandomVoiceChannelNames(
  channels: VoiceBasedChannel[]
): Promise<readonly [string, string][]> {
  if (!channels.length) {
    throw new Error('Array of channels passed is empty!');
  }

  // Pull list from json
  const { groups } = await getRandomVoiceChannelNamesFromFile();

  // Get random group
  const randomGroupIndex = Math.floor(Math.random() * groups.length);
  const names = [...groups[randomGroupIndex].names];

  // Get list of random names
  let numDefaultVoiceChannelNames = 0;
  const nameChannelMap: [string, VoiceBasedChannel][] = channels.map(
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

  // Get current name to new name map
  const oldToNewNameMap = nameChannelMap.map(([newName, voiceChannel]) => [
    voiceChannel.name,
    newName
  ]) as readonly [string, string][];

  // Set voice channel names
  const setAllNames = nameChannelMap.map(([randomName, voiceChannel]) =>
    voiceChannel.setName(randomName)
  );
  await Promise.all(setAllNames);

  return oldToNewNameMap;
}
