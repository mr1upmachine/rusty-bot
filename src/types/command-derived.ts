import type { Command } from '../types/command.js';

export type CommandDerived = new () => Command;
