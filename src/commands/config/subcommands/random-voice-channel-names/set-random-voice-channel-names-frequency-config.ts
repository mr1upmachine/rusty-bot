import type { Guild, VoiceBasedChannel } from 'discord.js';

import { useGuildChannelsRepository } from '../../../../db/use-guild-channels-repository.js';
import { useGuildsRepository } from '../../../../db/use-guilds-repository.js';
import { setupRandomVoiceChannelNamesCron } from '../../../../utilities/setup-random-voice-channel-names-cron.js';
import type { RandomVoiceChannelNamesFrequencyChoice } from './constants.js';
import { RANDOM_VOICE_CHANNEL_NAMES_FREQUENCY_MAP } from './constants.js';

export async function setRandomVoiceChannelNamesFrequencyConfig(
  guild: Guild,
  value: string
): Promise<string> {
  // Get dependencies
  const guildsRepository = useGuildsRepository();
  const guildChannelsRepository = useGuildChannelsRepository(guild.id);

  // Set value in database
  await guildsRepository.save(guild.id, {
    randomVoiceChannelNamesFrequency: value
  });

  // Fetch all enabled channels
  const dbEnabledChannels =
    await guildChannelsRepository.findByRandomVoiceChannelNames(true);
  const dbEnabledChannelIds = dbEnabledChannels.map(({ id }) => id);

  // Map dbChannels to discord channels
  const channels = Array.from(
    guild.channels.cache
      .filter((channel): channel is VoiceBasedChannel => channel.isVoiceBased())
      .filter((channel) => dbEnabledChannelIds.includes(channel.id))
      .values()
  );

  // Update cron job
  await setupRandomVoiceChannelNamesCron(guild, channels, value);

  // Build response text
  const choiceKeys = Object.keys(
    RANDOM_VOICE_CHANNEL_NAMES_FREQUENCY_MAP
  ) as RandomVoiceChannelNamesFrequencyChoice[];
  const valueText =
    choiceKeys
      .find((key) => RANDOM_VOICE_CHANNEL_NAMES_FREQUENCY_MAP[key] === value)
      ?.toLowerCase() ?? value;
  const response = `Random voice channel names will now update ${valueText}.`;
  return response;
}
