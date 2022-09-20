import { GuildMembersRepository } from './guild-members-repository.js';

export function useGuildMembersRepository(
  guildId: string
): GuildMembersRepository {
  return new GuildMembersRepository(guildId);
}
