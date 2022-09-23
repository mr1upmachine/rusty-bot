import { RustyBotCommandError } from '../errors/rusty-bot-errors.js';
import type { CommandDerived } from '../types/command-derived.js';
import type { Command } from '../types/command.js';

const registeredCommands = new Map<string, CommandDerived>();

export function registerCommand(name: string, command: CommandDerived): void {
  registeredCommands.set(name, command);
}

export function useCommand(commandName: string): Command {
  const command = registeredCommands.get(commandName);

  if (!command) {
    throw new RustyBotCommandError(
      'Uh oh, something went very wrong. Contact an admin.',
      `useCommand called with ${commandName}`
    );
  }

  const resolvedCommand = new command(commandName);

  return resolvedCommand;
}

export function useCommands(): Command[] {
  return Array.from(registeredCommands.entries()).map(
    ([cmdName, cmd]) => new cmd(cmdName)
  );
}
