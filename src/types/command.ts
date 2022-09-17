import type { Firestore } from '@google-cloud/firestore';
import type { ChatInputCommandInteraction } from 'discord.js';

import type {
  CommandBuilder,
  CommandBuilderOutput
} from './command-builder.js';

export abstract class Command {
  public abstract readonly name: string;
  public abstract readonly description: string;

  // TODO abstract store into separate class
  constructor(protected readonly firestore: Firestore) {}

  /** Constructs the slash command to be registered */
  build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder;
  }

  abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
