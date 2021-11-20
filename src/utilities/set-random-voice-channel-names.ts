import type { Client, Collection, VoiceBasedChannel } from 'discord.js';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as url from 'url';

/**
 * Current directory
 */
const CURRENT_DIR = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Relative file path to parse.
 */
const FILE_PATH = '../assets/voice-channel-names.txt';

/**
 * List of filter conditions to vlidate when parsing the file. If the result
 * is false, it will remove the line.
 */
const FILTERS: readonly ((str: string) => boolean)[] = [
  (str) => !str.startsWith('//'),
  (str) => str.length !== 0
];

export function setRandomVoiceChannelNames(client: Client<true>): void {
  // Parse & filter groups from file
  const groups = readFileSync(path.join(CURRENT_DIR, FILE_PATH))
    .toString()
    .split(/[\n]{2,}/gm)
    .map((group) => group.split('\n'))
    .map((group) =>
      group.filter((name) => FILTERS.every((filter) => filter(name)))
    )
    .filter((group) => group.length !== 0);

  // Get random group
  const randomGroupIndex = Math.floor(Math.random() * groups.length);
  const group = groups[randomGroupIndex];

  // Get voice channels for the current server
  const voiceChannels = Array.from(client.channels.cache)
    .map(([, channel]) => channel)
    .filter((channel) => channel.isVoiceBased()) as VoiceBasedChannel[];

  // Get list of random names
  const nameChannelMap: [string, VoiceBasedChannel][] = voiceChannels.map(
    (voiceChannel) => {
      const randomIndex = Math.floor(Math.random() * group.length);
      const randomName = group.splice(randomIndex, 1)[0];
      return [randomName, voiceChannel];
    }
  );

  // Set voice channel names
  for (const [randomName, voiceChannel] of nameChannelMap) {
    void voiceChannel.setName(randomName);
  }
}
