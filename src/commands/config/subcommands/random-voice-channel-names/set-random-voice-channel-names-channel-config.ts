import type { VoiceBasedChannel } from 'discord.js';

import { useGuildChannelsRepository } from '../../../../db/use-guild-channels-repository.js';
import { setupRandomVoiceChannelNamesCron } from '../../../../utilities/setup-random-voice-channel-names-cron.js';

export async function setRandomVoiceChannelNamesChannelConfig(
  channel: VoiceBasedChannel,
  value: boolean
): Promise<string> {
  const guild = channel.guild;

  // Get dependencies
  const guildChannelsRepository = useGuildChannelsRepository(channel.guild.id);

  // Set value in database
  await guildChannelsRepository.save(channel.id, {
    randomVoiceChannelNames: value
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
  setupRandomVoiceChannelNamesCron(guild, channels);

  // Build response text
  const valueText = value ? 'enabled' : 'disabled';
  const response = `Random voice channel names for ${channel.name} have been ${valueText}.`;
  return response;
}
