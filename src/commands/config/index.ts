import type {
  ChatInputCommandInteraction,
  GuildTextBasedChannel
} from 'discord.js';
import { PermissionFlagsBits, ChannelType } from 'discord.js';

import { Command } from '../../types/command.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import { setRandomVoiceChannelNamesConfig } from './set-random-voice-channel-names-config.js';
import { setKarmaTrackingConfig } from './set-karma-tracking-config.js';

enum ConfigSubcommand {
  KarmaTracking = 'karma-tracking',
  RandomVoiceChannelNames = 'random-voice-channel-names'
}

// TODO: Not implemented subcommands:
// setup: Once we have more than one config for a guild, we can use setup as a wizard to guide admins through them
// scan-members: If/when Rusty gets a website, this command will iterate through all existing users to make sure they have a document in firestore

export class ConfigCommand extends Command {
  public readonly name = 'config';
  public readonly description = 'Configuration settings on a per guild basis';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addSubcommand((subcommand) =>
        subcommand
          .setName(ConfigSubcommand.KarmaTracking)
          .setDescription(
            'Set which channels have message reactions tracked for karma'
          )
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('The channel to modify')
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildText)
          )
          .addBooleanOption((option) =>
            option
              .setName('value')
              .setDescription('Enable or disable karma tracking')
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName(ConfigSubcommand.RandomVoiceChannelNames)
          .setDescription(
            'Enables the voice channels to cycle through random names'
          )
          .addBooleanOption((option) =>
            option
              .setName('value')
              .setDescription('Enable or disable channel name cycling')
              .setRequired(true)
          )
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.inGuild()) {
      return;
    }

    const subcommandName =
      interaction.options.getSubcommand() as ConfigSubcommand;

    await interaction.deferReply({ ephemeral: true });

    let response = '';
    switch (subcommandName) {
      case ConfigSubcommand.RandomVoiceChannelNames: {
        const value = interaction.options.getBoolean('value', true);
        response = await setRandomVoiceChannelNamesConfig(
          this.firestore,
          interaction.guild!,
          value
        );
        break;
      }
      case ConfigSubcommand.KarmaTracking: {
        const value = interaction.options.getBoolean('value', true);
        const channel = interaction.options.getChannel(
          'channel',
          true
        ) as GuildTextBasedChannel;
        response = await setKarmaTrackingConfig(this.firestore, channel, value);
        break;
      }
    }

    await interaction.editReply(response);
  }
}
