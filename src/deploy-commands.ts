import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

import { COMMANDS } from './commands/index.js';
import { buildCommand } from './utilities/build-command.js';
import { useCommand } from './utilities/use-command.js';

export async function deployCommands(
  clientId: string,
  guildId: string,
  token: string
): Promise<void> {
  const rest = new REST({ version: '9' }).setToken(token);
  const commandsJSON = COMMANDS.map((commandDerived) =>
    useCommand(commandDerived)
  ).map((command) => buildCommand(command));

  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commandsJSON
    });

    console.log('Successfully registered application commands.');
  } catch (e: unknown) {
    console.error(e);
  }
}
