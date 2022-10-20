import type { Guild, GuildMember, Role } from 'discord.js';

import { useGuildsRepository } from '../db/use-guilds-repository.js';
import { Logger } from './logger.js';

const loggerMap = new Map<string, Logger>();

export async function useLogger(guild: Guild): Promise<Logger> {
  const logger = loggerMap.get(guild.id);

  if (logger) {
    return logger;
  }

  const guildsRepository = useGuildsRepository();
  const dbGuild = await guildsRepository.findById(guild.id);

  if (!dbGuild?.logChannelId) {
    throw new Error();
  }

  const channel = await guild.client.channels.fetch(dbGuild.logChannelId);

  if (!channel?.isTextBased()) {
    throw new Error();
  }

  const mentionable: Role | GuildMember =
    (dbGuild.logRoleId ? await guild.roles.fetch(dbGuild.logRoleId) : null) ??
    (await guild.fetchOwner());

  const newLogger = new Logger(guild, channel, mentionable);

  loggerMap.set(guild.id, newLogger);

  return newLogger;
}

export async function updateLogger(guild: Guild): Promise<Logger> {
  loggerMap.delete(guild.id);
  return useLogger(guild);
}
