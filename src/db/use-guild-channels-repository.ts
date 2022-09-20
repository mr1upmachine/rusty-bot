import { GuildChannelsRepository } from './guild-channels-repository.js';

export function useGuildChannelsRepository(
  guildId: string
): GuildChannelsRepository {
  return new GuildChannelsRepository(guildId);
}
