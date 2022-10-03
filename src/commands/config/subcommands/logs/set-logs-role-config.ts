import type { Role } from 'discord.js';

import { useGuildsRepository } from '../../../../db/use-guilds-repository.js';
import { updateLogger } from '../../../../services/use-logger.js';

export async function setLogsRoleConfig(role: Role): Promise<string> {
  const guild = role.guild;

  // Get dependencies
  const guildsRepository = useGuildsRepository();

  // Update database
  await guildsRepository.save(guild.id, {
    logRoleId: role.id
  });

  // Update cached logger
  await updateLogger(guild);

  // Build response text
  return `Logs with mentions will now tag ${role.toString()}`;
}
