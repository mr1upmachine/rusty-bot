import type {
  ChatInputCommandInteraction,
  VoiceBasedChannel
} from 'discord.js';

import type { RandomVoiceChannelNamesFrequencyCron } from './constants.js';
import { RandomVoiceChannelNamesSubcommand } from './constants.js';
import { setRandomVoiceChannelNamesChannelConfig } from './set-random-voice-channel-names-channel-config.js';
import { setRandomVoiceChannelNamesFrequencyConfig } from './set-random-voice-channel-names-frequency-config.js';

export async function randomVoiceChannelNamesSubcommand(
  interaction: ChatInputCommandInteraction
): Promise<string> {
  const guild = interaction.guild!;

  // Get subcommand
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
    case RandomVoiceChannelNamesSubcommand.Frequency: {
      const value = interaction.options.getString(
        'value',
        true
      ) as RandomVoiceChannelNamesFrequencyCron;
      return setRandomVoiceChannelNamesFrequencyConfig(guild, value);
    }
  }
}
