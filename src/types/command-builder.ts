import type { SharedNameAndDescription, SlashCommandBuilder } from 'discord.js';

export type CommandBuilder = Omit<
  SlashCommandBuilder,
  keyof SharedNameAndDescription
>;

export type CommandBuilderOutput = Pick<SlashCommandBuilder, 'toJSON'>;
