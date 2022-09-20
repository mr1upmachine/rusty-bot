import type { Guild } from 'discord.js';

import { useGuildsRepository } from '../../../../db/use-guilds-repository.js';
import { disableRandomVoiceChannelNames } from '../../../../utilities/disable-random-voice-channel-names.js';
import { enableRandomVoiceChannelNames } from '../../../../utilities/enable-random-voice-channel-names.js';

export async function setRandomVoiceChannelNamesEnabledConfig(
  guild: Guild,
  value: boolean
): Promise<string> {
  // Get dependencies
  const guildsRepository = useGuildsRepository();

  // Save config to the db
  await guildsRepository.save(guild.id, { randomVoiceChannelNames: value });

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
