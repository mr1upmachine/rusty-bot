import { COMMANDS } from '../commands/index.js';
import type { Command } from '../types/command.js';
import type { CommandConstructorParameters } from '../types/command-constructor-parameters.js';
import type { CommandDerived } from '../types/command-derived.js';

export function useCommand(
  commandOrCommandName: CommandDerived | string,
  params: CommandConstructorParameters
): Command {
  const commandDerived =
    typeof commandOrCommandName === 'string'
      ? COMMANDS.find((cmd) => new cmd(...params).name === commandOrCommandName)
      : commandOrCommandName;

  if (!commandDerived) {
    throw new Error(`Command does not exist`);
  }

  return new commandDerived(...params);
}
