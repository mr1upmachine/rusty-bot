import type {
  ChatInputCommandInteraction,
  GuildTextBasedChannel
} from 'discord.js';
import { setKarmaTrackingConfig } from './set-karma-tracking-config.js';
import { KarmaTrackingSubcommand } from './types.js';

export async function karmaTrackingSubcommand(
  interaction: ChatInputCommandInteraction<'cached'>
): Promise<string> {
  const subcommandName = interaction.options.getSubcommand(
    true
  ) as KarmaTrackingSubcommand;

  switch (subcommandName) {
    case KarmaTrackingSubcommand.Channel: {
      const value = interaction.options.getBoolean('value', true);
      const channel = interaction.options.getChannel(
        'channel',
        true
      ) as GuildTextBasedChannel;
      return setKarmaTrackingConfig(channel, value);
    }
  }
}
