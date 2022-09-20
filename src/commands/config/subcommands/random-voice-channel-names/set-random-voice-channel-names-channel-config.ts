import type { VoiceBasedChannel } from 'discord.js';

import { useGuildChannelsRepository } from '../../../../db/use-guild-channels-repository.js';

export async function setRandomVoiceChannelNamesChannelConfig(
  channel: VoiceBasedChannel,
  value: boolean
): Promise<string> {
  // Get dependencies
  const guildChannelsRepository = useGuildChannelsRepository(channel.guild.id);

  // Set value in database
  await guildChannelsRepository.save(channel.id, {
    randomVoiceChannelNames: value
  });

  // Build response text
  const valueText = value ? 'enabled' : 'disabled';
  const response = `Random voice channel names for ${channel.name} have been ${valueText}.`;
  return response;
}
