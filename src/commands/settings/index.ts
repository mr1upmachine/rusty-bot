import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';

import { Command } from '../../types/command.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import { karma } from './karma.js';
import { scanMembers } from './scan-members.js';
import { setup } from './setup.js';

// TODO: Not implemented/not validated subcommands:
// setup: Once we have more than one setting for a guild, we can use setup as a wizard to guide admins through them
// scan-members: If/when Rusty gets a website, this command will iterate through all existing users to make sure they have a document in firestore

export class SettingsCommand extends Command {
  public readonly name = 'settings';
  public readonly description = 'Configuration options';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder
      .addSubcommand((subcommand) =>
        subcommand.setName('setup').setDescription('First time setup wizard')
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('karma')
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
    const member = interaction.member as GuildMember;
    const subcommand = interaction.options.getSubcommand();

    // Ensures only admins may use this command
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      throw new Error(
        'Insufficient permissions. Only Administrators may use this command.'
      );
    }

    switch (subcommand) {
      case 'setup':
        await setup(interaction);
        break;

      case 'karma':
        await karma(this.firestore, interaction);
        break;

      case 'scan-members':
        await scanMembers(this.firestore, interaction);
        break;

      default:
        throw new Error('Unable to determine subcommand');
    }
  }
}
