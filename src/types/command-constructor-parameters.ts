import type { Command } from './command.js';

export type CommandConstructorParameters = ConstructorParameters<
  typeof Command
>;
