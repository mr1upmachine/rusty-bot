import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionFlagsBits, ChannelType } from 'discord.js';

import { Command } from '../../types/command.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import { karmaTrackingSubcommand } from './subcommands/karma-tracking/index.js';
import { randomVoiceChannelNamesSubcommand } from './subcommands/random-voice-channel-names/index.js';
import { RandomVoiceChannelNamesSubcommand } from './subcommands/random-voice-channel-names/types.js';
import { KarmaTrackingSubcommand } from './subcommands/karma-tracking/types.js';

enum ConfigSubcommandGroup {
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
      .addSubcommandGroup((subcommandGroup) =>
        subcommandGroup
          .setName(ConfigSubcommandGroup.KarmaTracking)
          .setDescription('Config for the karma tracking feature')
          .addSubcommand((subcommand) =>
            subcommand
              .setName(KarmaTrackingSubcommand.Channel)
              .setDescription(
                'Set which specific channels have message reactions tracked for karma'
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
      )
      .addSubcommandGroup((subcommandGroup) =>
        subcommandGroup
          .setName(ConfigSubcommandGroup.RandomVoiceChannelNames)
          .setDescription('Config for the random voice channel name feature')
          .addSubcommand((subcommand) =>
            subcommand
              .setName(RandomVoiceChannelNamesSubcommand.Channel)
              .setDescription(
                'Set which specific voice channels will have random names'
              )
              .addChannelOption((option) =>
                option
                  .setName('channel')
                  .setDescription('The channel to modify')
                  .setRequired(true)
                  .addChannelTypes(ChannelType.GuildVoice)
              )
              .addBooleanOption((option) =>
                option
                  .setName('value')
                  .setDescription(
                    'Enable or disable random voice channel names'
                  )
                  .setRequired(true)
              )
          )
          .addSubcommand((subcommand) =>
            subcommand
              .setName(RandomVoiceChannelNamesSubcommand.Enabled)
              .setDescription(
                'Enables the voice channels to cycle through random names'
              )
              .addBooleanOption((option) =>
                option
                  .setName('value')
                  .setDescription('Enable or disable channel name cycling')
                  .setRequired(true)
              )
          )
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.inGuild()) {
      return;
    }

    const subcommandGroupName = interaction.options.getSubcommandGroup(
      true
    ) as ConfigSubcommandGroup;

    await interaction.deferReply({ ephemeral: true });

    let response = '';
    switch (subcommandGroupName) {
      case ConfigSubcommandGroup.KarmaTracking: {
        response = await karmaTrackingSubcommand(this.firestore, interaction);
        break;
      }
      case ConfigSubcommandGroup.RandomVoiceChannelNames: {
        response = await randomVoiceChannelNamesSubcommand(
          this.firestore,
          interaction
        );
        break;
      }
    }

    await interaction.editReply(response);
  }
}
