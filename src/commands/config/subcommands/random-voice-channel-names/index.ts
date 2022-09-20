import type {
  ChatInputCommandInteraction,
  VoiceBasedChannel
} from 'discord.js';

import { setRandomVoiceChannelNamesChannelConfig } from './set-random-voice-channel-names-channel-config.js';
import { setRandomVoiceChannelNamesEnabledConfig } from './set-random-voice-channel-names-enabled-config.js';
import { RandomVoiceChannelNamesSubcommand } from './types.js';

export async function randomVoiceChannelNamesSubcommand(
  interaction: ChatInputCommandInteraction
): Promise<string> {
  const subcommandName = interaction.options.getSubcommand(
    true
  ) as RandomVoiceChannelNamesSubcommand;

  switch (subcommandName) {
    case RandomVoiceChannelNamesSubcommand.Channel: {
      const value = interaction.options.getBoolean('value', true);
      const channel = interaction.options.getChannel(
        'channel',
        true
      ) as VoiceBasedChannel;
      return setRandomVoiceChannelNamesChannelConfig(channel, value);
    }
    case RandomVoiceChannelNamesSubcommand.Enabled: {
      const value = interaction.options.getBoolean('value', true);
      return setRandomVoiceChannelNamesEnabledConfig(interaction.guild!, value);
    }
  }
}
