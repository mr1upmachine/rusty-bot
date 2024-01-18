import type { ChatInputCommandInteraction } from 'discord.js';

import type {
  CommandBuilder,
  CommandBuilderOutput
} from './command-builder.js';

export abstract class Command {
  public abstract readonly description: string;

  constructor(public readonly commandName: string) {}

  /** Constructs the slash command to be registered */
  build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder;
  }

  abstract execute(
    interaction: ChatInputCommandInteraction<'cached'>
  ): Promise<void>;
}
