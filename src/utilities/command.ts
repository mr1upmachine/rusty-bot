import { SlashCommandBuilder } from '@discordjs/builders';
import { Firestore } from '@google-cloud/firestore';
import { CommandInteraction } from 'discord.js';

export type CommandDerived = new (firestore: Firestore) => Command;

export abstract class Command {
  // TODO abstract store into separate class
  constructor(protected firestore: Firestore) {}
  abstract build(): Promise<
    Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
  >;
  abstract execute(interaction: CommandInteraction): Promise<void>;
}
