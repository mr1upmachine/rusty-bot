import { SlashCommandBuilder } from 'discord.js';

import type { Command } from '../types/command.js';
import type { CommandJSON } from '../types/command-json.js';

export function buildCommand(command: Command): CommandJSON {
  const commandBuilder = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description);
  const modifiedCommandBuilder = command.build(commandBuilder);
  return modifiedCommandBuilder.toJSON();
}
