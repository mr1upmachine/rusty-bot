import { GuildMessagesRepository } from './guild-messages-repository.js';

export function useGuildMessagesRepository(
  guildId: string,
  channelId: string
): GuildMessagesRepository {
  return new GuildMessagesRepository(guildId, channelId);
}
