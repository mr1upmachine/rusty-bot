import { Firestore } from '@google-cloud/firestore';
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';

export type CommandDerived = new (firestore: Firestore) => Command;

export abstract class Command {
  // TODO abstract store into separate class
  constructor(protected firestore: Firestore) {}
  abstract build(): Promise<
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
  >;
  abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
