import type { CommandDerived } from '../types/command-derived.js';
import { AboutCommand } from './about/index.js';
import { ColorCommand } from './color/index.js';
import { InfoCommand } from './info/index.js';
import { PingCommand } from './ping/index.js';
import { ProfileCommand } from './profile/index.js';
import { RollCommand } from './roll/index.js';
import { SettingsCommand } from './settings/index.js';
import { SizeCommand } from './size/index.js';

export const COMMANDS: readonly CommandDerived[] = [
  AboutCommand,
  ColorCommand,
  InfoCommand,
  PingCommand,
  ProfileCommand,
  RollCommand,
  SettingsCommand,
  SizeCommand
];
