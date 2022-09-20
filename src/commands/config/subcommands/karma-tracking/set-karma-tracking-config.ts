import type { GuildTextBasedChannel } from 'discord.js';

import { useGuildChannelsRepository } from '../../../../db/use-guild-channels-repository.js';

/** Enables or disables karma tracking on a channel in Firebase */
export async function setKarmaTrackingConfig(
  channel: GuildTextBasedChannel,
  value: boolean
): Promise<string> {
  // Get dependencies
  const guildChannelsRepository = useGuildChannelsRepository(channel.guild.id);

  // Set value in database
  await guildChannelsRepository.save(channel.id, { karmaTracking: value });

  // Build response text
  const valueText = value ? 'enabled' : 'disabled';
  const response = `Karma tracking for ${channel.name} has been ${valueText}.`;
  return response;
}
