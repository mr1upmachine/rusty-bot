import type { CommandDerived } from '../types/command-derived.js';
import { AboutCommand } from './about/index.js';
import { ColorCommand } from './color/index.js';
import { ConfigCommand } from './config/index.js';
import { EditProfileCommand } from './edit-profile/index.js';
import { PingCommand } from './ping/index.js';
import { ProfileCommand } from './profile/index.js';
import { RollCommand } from './roll/index.js';
import { SetRandomVoiceChannelNamesCommand } from './set-random-voice-channel-names/index.js';
import { SizeCommand } from './size/index.js';

// TODO go back to dynamic commands with new `import()` syntax
export const COMMANDS: readonly CommandDerived[] = [
  AboutCommand,
  ColorCommand,
  ConfigCommand,
  EditProfileCommand,
  PingCommand,
  ProfileCommand,
  RollCommand,
  SetRandomVoiceChannelNamesCommand,
  SizeCommand
];
