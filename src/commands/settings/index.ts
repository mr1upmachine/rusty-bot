import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';

import { Command } from '../../types/command.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import { karma } from './settings-karma.js';

enum SettingsSubcommand {
  Karma = 'karma'
}

// TODO: Not implemented subcommands:
// setup: Once we have more than one setting for a guild, we can use setup as a wizard to guide admins through them
// scan-members: If/when Rusty gets a website, this command will iterate through all existing users to make sure they have a document in firestore

export class SettingsCommand extends Command {
  public readonly name = 'settings';
  public readonly description = 'Configuration options';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addSubcommand((subcommand) =>
        subcommand
          .setName(SettingsSubcommand.Karma)
          .setDescription(
            'Set which channels have message reactions tracked for karma'
          )
          .addChannelOption((option) =>
            option
              .setName('channel')
              .setDescription('The channel to modify')
              .setRequired(true)
          )
          .addBooleanOption((option) =>
            option
              .setName('value')
              .setDescription('Enable or disable tracking')
              .setRequired(false)
          )
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.inGuild()) {
      return;
    }

    const subcommandName =
      interaction.options.getSubcommand() as SettingsSubcommand;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (subcommandName === SettingsSubcommand.Karma) {
      await karma(this.firestore, interaction);
    }
  }
}
