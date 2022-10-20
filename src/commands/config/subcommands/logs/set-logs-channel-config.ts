import type { TextChannel } from 'discord.js';

import { useGuildsRepository } from '../../../../db/use-guilds-repository.js';
import { updateLogger } from '../../../../services/use-logger.js';

export async function setLogsChannelConfig(
  channel: TextChannel
): Promise<string> {
  const guild = channel.guild;

  // Get dependencies
  const guildsRepository = useGuildsRepository();

  // Update database
  await guildsRepository.save(guild.id, {
    logChannelId: channel.id
  });

  // Update cached logger
  const logger = await updateLogger(guild);

  // Message in logging channel
  const firstMessage =
    'Hey all! I will now be logging information & requests in this channel going forward. ' +
    "If you don't want to be spammed, make sure to either mute or set this channel to mentions only. " +
    "I'll only tag the configured role when I have a request or something important to say. Thanks!";
  await logger.info(firstMessage, true);

  // Build response text
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return `Logs will now appear in ${channel.toString()}`;
}
