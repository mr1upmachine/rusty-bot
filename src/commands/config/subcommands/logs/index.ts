import type { ChatInputCommandInteraction } from 'discord.js';
import { BaseChannel, ChannelType, Role } from 'discord.js';

import { LogsSubcommand } from './constants.js';
import { setLogsChannelConfig } from './set-logs-channel-config.js';
import { setLogsRoleConfig } from './set-logs-role-config.js';

export async function logsSubcommand(
  interaction: ChatInputCommandInteraction
): Promise<string> {
  // Get subcommand
  const subcommandName = interaction.options.getSubcommand(
    true
  ) as LogsSubcommand;

  switch (subcommandName) {
    case LogsSubcommand.Channel: {
      const channel = interaction.options.getChannel('value', true);

      if (
        !(channel instanceof BaseChannel) ||
        channel.type !== ChannelType.GuildText
      ) {
        throw new Error('Channel must be text based');
      }

      return setLogsChannelConfig(channel);
    }
    case LogsSubcommand.Role: {
      const role = interaction.options.getRole('value', true);

      if (!(role instanceof Role)) {
        throw new Error('Role must come from interaction');
      }

      return setLogsRoleConfig(role);
    }
  }
}
